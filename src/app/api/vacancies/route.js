export async function GET() {
  const BASE_URL = "https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies-aktif";
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    return Response.json({ error: "Access token tidak dikonfigurasi" }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  };

  const fetchOptions = {
    headers,
    cache: 'no-store',
  };

  let allData = [];
  const limit = 100;

  try {
    const firstRes = await fetch(`${BASE_URL}?order_direction=ASC&page=1&limit=${limit}`, fetchOptions);
    if (!firstRes.ok) {
      return Response.json({ error: `Gagal mengambil data awal: ${firstRes.status}` }, { status: firstRes.status });
    }

    const firstData = await firstRes.json();
    allData = [...(firstData.data || [])];
    
    const totalPages = firstData.meta?.pagination?.last_page || 1;
    
    if (totalPages > 1) {
      const promises = [];
      for (let p = 2; p <= totalPages; p++) {
        const url = `${BASE_URL}?order_direction=ASC&page=${p}&limit=${limit}`;
        promises.push(
          fetch(url, fetchOptions)
            .then(res => {
              if (!res.ok) throw new Error(`Gagal di halaman ${p}`);
              return res.json();
            })
            .then(data => data.data || [])
        );
      }
      
      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allData.push(...result.value);
        } else if (result.status === 'rejected') {
          console.error("Gagal mengambil data dari satu halaman:", result.reason.message);
        }
      });
    }

    return Response.json({ 
      success: true,
      total: allData.length, 
      data: allData 
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
