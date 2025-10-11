import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Briefcase, Users, Filter, X, Moon, Sun, Building2, GraduationCap, ChevronLeft, ChevronRight, Bookmark, RotateCcw } from 'lucide-react';

const MagangHub = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedKabupatens, setSelectedKabupatens] = useState([]);
  const [selectedProdis, setSelectedProdis] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [kabupatenSearch, setKabupatenSearch] = useState('');
  const [prodiSearch, setProdiSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showKabupatenDropdown, setShowKabupatenDropdown] = useState(false);
  const [showProdiDropdown, setShowProdiDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    fetchAllJobs();
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) {
      setBookmarkedJobs(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProvinces, selectedKabupatens, selectedProdis, selectedCompanies, sortBy, itemsPerPage, activeTab]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.province-filter')) setShowProvinceDropdown(false);
      if (!e.target.closest('.kabupaten-filter')) setShowKabupatenDropdown(false);
      if (!e.target.closest('.prodi-filter')) setShowProdiDropdown(false);
      if (!e.target.closest('.company-filter')) setShowCompanyDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedJob) {
        setSelectedJob(null);
      } else if (showDisclaimer) {
        setShowDisclaimer(false);
      } else {
        setShowProvinceDropdown(false);
        setShowKabupatenDropdown(false);
        setShowCompanyDropdown(false);
        setShowProdiDropdown(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedJob, showDisclaimer]);

  useEffect(() => {
    const isModalOpen = selectedJob || showDisclaimer;
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';

    if (selectedJob) {
      const modalElement = document.querySelector('[aria-labelledby="modal-title"]');
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const handleTabKey = (e) => {
          if (e.key !== 'Tab') return;
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        };
        modalElement.addEventListener('keydown', handleTabKey);
        firstElement?.focus();
        return () => modalElement.removeEventListener('keydown', handleTabKey);
      }
    }
  }, [selectedJob, showDisclaimer]);

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vacancies`);
      const data = await res.json();
      if (data.error) {
        console.error("Gagal ambil data:", data.error);
        setAllJobs([]);
      } else {
        setAllJobs(data.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const parseProdi = (prodiString) => {
    try {
      return JSON.parse(prodiString);
    } catch {
      return [];
    }
  };

  const handleMultiSelect = (setter, prevSelected, value) => {
    setter(prevSelected.includes(value) ? prevSelected.filter(item => item !== value) : [...prevSelected, value]);
  };

  const handleProvinceSelect = (province) => {
    handleMultiSelect(setSelectedProvinces, selectedProvinces, province);
    setProvinceSearch('');
    setShowProvinceDropdown(false);
  };

  const handleKabupatenSelect = (kabupaten) => {
    handleMultiSelect(setSelectedKabupatens, selectedKabupatens, kabupaten);
    setKabupatenSearch('');
    setShowKabupatenDropdown(false);
  };

  const handleProdiSelect = (prodi) => {
    handleMultiSelect(setSelectedProdis, selectedProdis, prodi);
    setProdiSearch('');
    setShowProdiDropdown(false);
  };

  const handleCompanySelect = (company) => {
    handleMultiSelect(setSelectedCompanies, selectedCompanies, company);
    setCompanySearch('');
    setShowCompanyDropdown(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProvinces([]);
    setSelectedKabupatens([]);
    setSelectedCompanies([]);
    setSelectedProdis([]);
    setProvinceSearch('');
    setKabupatenSearch('');
    setCompanySearch('');
    setProdiSearch('');
    setSortBy('newest');
  };

  const toggleBookmark = (jobId) => {
    const updated = bookmarkedJobs.includes(jobId)
      ? bookmarkedJobs.filter(id => id !== jobId)
      : [...bookmarkedJobs, jobId];
    setBookmarkedJobs(updated);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(updated));
  };

  const availableProvinces = useMemo(() => {
    const relevantJobs = allJobs.filter(job => {
      const matchCompany = selectedCompanies.length === 0 || selectedCompanies.includes(job.perusahaan?.nama_perusahaan);
      const matchProdi = selectedProdis.length === 0 || parseProdi(job.program_studi).some(p => selectedProdis.includes(p.title));
      return matchCompany && matchProdi;
    });
    return [...new Set(relevantJobs.map(job => job.perusahaan?.nama_provinsi).filter(Boolean))].sort();
  }, [allJobs, selectedCompanies, selectedProdis]);

  const availableKabupatens = useMemo(() => {
    const relevantJobs = allJobs.filter(job => {
      const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(job.perusahaan?.nama_provinsi);
      const matchCompany = selectedCompanies.length === 0 || selectedCompanies.includes(job.perusahaan?.nama_perusahaan);
      const matchProdi = selectedProdis.length === 0 || parseProdi(job.program_studi).some(p => selectedProdis.includes(p.title));
      return matchProvince && matchCompany && matchProdi;
    });
    return [...new Set(relevantJobs.map(job => job.perusahaan?.nama_kabupaten).filter(Boolean))].sort();
  }, [allJobs, selectedProvinces, selectedCompanies, selectedProdis]);

  const availableCompanies = useMemo(() => {
    const relevantJobs = allJobs.filter(job => {
      const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(job.perusahaan?.nama_provinsi);
      const matchKabupaten = selectedKabupatens.length === 0 || selectedKabupatens.includes(job.perusahaan?.nama_kabupaten);
      const matchProdi = selectedProdis.length === 0 || parseProdi(job.program_studi).some(p => selectedProdis.includes(p.title));
      return matchProvince && matchKabupaten && matchProdi;
    });
    return [...new Set(relevantJobs.map(job => job.perusahaan?.nama_perusahaan).filter(Boolean))].sort();
  }, [allJobs, selectedProvinces, selectedKabupatens, selectedProdis]);

  const availableProdis = useMemo(() => {
    const relevantJobs = allJobs.filter(job => {
      const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(job.perusahaan?.nama_provinsi);
      const matchKabupaten = selectedKabupatens.length === 0 || selectedKabupatens.includes(job.perusahaan?.nama_kabupaten);
      const matchCompany = selectedCompanies.length === 0 || selectedCompanies.includes(job.perusahaan?.nama_perusahaan);
      return matchProvince && matchKabupaten && matchCompany;
    });
    const prodiSet = new Set();
    relevantJobs.forEach(job => {
      const prodis = parseProdi(job.program_studi);
      prodis.forEach(p => prodiSet.add(p.title));
    });
    return Array.from(prodiSet).sort();
  }, [allJobs, selectedProvinces, selectedKabupatens, selectedCompanies]);

  useEffect(() => {
    const validSelections = selectedProvinces.filter(p => availableProvinces.includes(p));
    if (validSelections.length !== selectedProvinces.length) {
      setSelectedProvinces(validSelections);
    }
  }, [availableProvinces]);

  useEffect(() => {
    const validSelections = selectedKabupatens.filter(k => availableKabupatens.includes(k));
    if (validSelections.length !== selectedKabupatens.length) {
      setSelectedKabupatens(validSelections);
    }
  }, [availableKabupatens]);

  useEffect(() => {
    const validSelections = selectedCompanies.filter(c => availableCompanies.includes(c));
    if (validSelections.length !== selectedCompanies.length) {
      setSelectedCompanies(validSelections);
    }
  }, [availableCompanies]);

  useEffect(() => {
    const validSelections = selectedProdis.filter(p => availableProdis.includes(p));
    if (validSelections.length !== selectedProdis.length) {
      setSelectedProdis(validSelections);
    }
  }, [availableProdis]);

  const filteredProvinces = useMemo(() => availableProvinces.filter(prov => prov.toLowerCase().includes(provinceSearch.toLowerCase())), [availableProvinces, provinceSearch]);
  const filteredCompanies = useMemo(() => availableCompanies.filter(comp => comp.toLowerCase().includes(companySearch.toLowerCase())), [availableCompanies, companySearch]);
  const filteredProdi = useMemo(() => availableProdis.filter(prodi => prodi.toLowerCase().includes(prodiSearch.toLowerCase())), [availableProdis, prodiSearch]);
  const filteredKabupatens = useMemo(() => availableKabupatens.filter(kab => kab.toLowerCase().includes(kabupatenSearch.toLowerCase())), [availableKabupatens, kabupatenSearch]);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs.filter(job => {
      const matchSearch = !searchQuery || job.posisi.toLowerCase().includes(searchQuery.toLowerCase()) || job.perusahaan?.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(job.perusahaan?.nama_provinsi);
      const matchKabupaten = selectedKabupatens.length === 0 || selectedKabupatens.includes(job.perusahaan?.nama_kabupaten);
      const matchProdi = selectedProdis.length === 0 || parseProdi(job.program_studi).some(p => selectedProdis.includes(p.title));
      const matchCompany = selectedCompanies.length === 0 || selectedCompanies.includes(job.perusahaan?.nama_perusahaan);
      const matchBookmark = activeTab === 'all' || bookmarkedJobs.includes(job.id_posisi);
      return matchSearch && matchProvince && matchKabupaten && matchProdi && matchCompany && matchBookmark;
    });

    if (sortBy === 'newest') {
      jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      jobs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'applicants') {
      jobs.sort((a, b) => a.jumlah_terdaftar - b.jumlah_terdaftar);
    }

    return jobs;
  }, [allJobs, searchQuery, selectedProvinces, selectedKabupatens, selectedProdis, selectedCompanies, sortBy, activeTab, bookmarkedJobs]);

  const handleKeyDown = (e, filterType) => {
    const lists = {
      province: filteredProvinces,
      kabupaten: filteredKabupatens,
      company: filteredCompanies,
      prodi: filteredProdi,
    };
    const handlers = {
      province: handleProvinceSelect,
      kabupaten: handleKabupatenSelect,
      company: handleCompanySelect,
      prodi: handleProdiSelect,
    };
  
    const items = lists[filterType];
    const handler = handlers[filterType];
  
    if (!items || items.length === 0) return;
  
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handler(items[highlightedIndex]);
      setHighlightedIndex(-1);
    }
  };
  
  useEffect(() => { setHighlightedIndex(-1); }, [showProvinceDropdown, showKabupatenDropdown, showCompanyDropdown, showProdiDropdown]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalApplicants = allJobs.reduce((sum, job) => sum + (job.jumlah_terdaftar || 0), 0);
    const uniqueCompanies = new Set(allJobs.map(job => job.perusahaan?.id_perusahaan)).size;
    return {
      totalJobs: allJobs.length,
      totalApplicants,
      totalCompanies: uniqueCompanies
    };
  }, [allJobs]);

  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${theme} transition-colors duration-300`}>
      <header className={`sticky top-0 z-50 ${cardBg} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="NextStep Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NextStep
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${inputBg} hover:bg-opacity-80 transition-all hover:scale-110 active:scale-100`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn" style={{ animationDelay: '100ms' }}>
              Temukan Peluang Magang Impianmu
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} animate-fadeIn`} style={{ animationDelay: '200ms' }}>
              Langkah kecil hari ini bisa jadi awal karier besar di masa depan
            </p>
            <p className={`text-base mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} animate-fadeIn`} style={{ animationDelay: '300ms' }}>
              Semoga sukses bersama
            </p>
          </div>

          <div className={`max-w-3xl mx-auto ${cardBg} rounded-2xl shadow-xl p-2 animate-fadeIn`} style={{ animationDelay: '400ms' }}>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari posisi atau perusahaan..."
                  aria-label="Cari posisi atau perusahaan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-3 bg-transparent outline-none`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 hover:scale-105 active:scale-100"
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className={`${cardBg} rounded-xl p-6 text-center shadow-lg animate-fadeIn`} style={{ animationDelay: '500ms' }}>
              <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600">{stats.totalJobs.toLocaleString()}</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lowongan Aktif</div>
            </div>
            <div className={`${cardBg} rounded-xl p-6 text-center shadow-lg animate-fadeIn`} style={{ animationDelay: '600ms' }}>
              <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-600">{stats.totalCompanies}</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Perusahaan</div>
            </div>
            <div className={`${cardBg} rounded-xl p-6 text-center shadow-lg animate-fadeIn`} style={{ animationDelay: '700ms' }}>
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600">{stats.totalApplicants.toLocaleString()}</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Pendaftar</div>
            </div>
          </div>
        </div>
      </section>

      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className={`${cardBg} rounded-xl p-6 shadow-lg border ${borderColor} animate-slideDownFadeIn`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Filter Pencarian</h3>
                <button
                  onClick={handleResetFilters}
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95"
                  aria-label="Reset semua filter"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Reset Filter</span>
                </button>
              </div>
              <button 
                onClick={() => setShowFilters(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="relative province-filter">
                <label className="block text-sm font-medium mb-2">Provinsi</label>
                <input type="text" placeholder="Cari provinsi..." value={provinceSearch}
                  onChange={(e) => { setProvinceSearch(e.target.value); setShowProvinceDropdown(true); }}
                  onFocus={() => { setShowProvinceDropdown(true); setHighlightedIndex(-1); }}
                  onKeyDown={(e) => handleKeyDown(e, 'province')}
                  className={`w-full p-3 rounded-lg ${inputBg} border ${borderColor} outline-none`}
                />
                {showProvinceDropdown && filteredProvinces.length > 0 && (
                  <div className={`absolute z-20 w-full mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                    {filteredProvinces.map((prov, index) => (
                      <button key={prov} onClick={() => handleProvinceSelect(prov)}
                        className={`w-full text-left px-4 py-2 ${
                            index === highlightedIndex ? (darkMode ? 'bg-gray-600' : 'bg-blue-100') : ''
                            } hover:bg-blue-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${selectedProvinces.includes(prov) ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
                      >{prov}</button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProvinces.map(prov => (
                    <span key={prov} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {prov}
                      <button onClick={() => handleProvinceSelect(prov)} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative kabupaten-filter">
                <label className="block text-sm font-medium mb-2">Kabupaten/Kota</label>
                <input type="text" placeholder="Cari kabupaten..." value={kabupatenSearch}
                  onChange={(e) => { setKabupatenSearch(e.target.value); setShowKabupatenDropdown(true); }}
                  onFocus={() => { setShowKabupatenDropdown(true); setHighlightedIndex(-1); }}
                  onKeyDown={(e) => handleKeyDown(e, 'kabupaten')}
                  className={`w-full p-3 rounded-lg ${inputBg} border ${borderColor} outline-none`}
                  disabled={availableKabupatens.length === 0}
                />
                {showKabupatenDropdown && filteredKabupatens.length > 0 && (
                  <div className={`absolute z-20 w-full mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                    {filteredKabupatens.map((kab, index) => (
                      <button key={kab} onClick={() => handleKabupatenSelect(kab)}
                        className={`w-full text-left px-4 py-2 ${
                            index === highlightedIndex ? (darkMode ? 'bg-gray-600' : 'bg-blue-100') : ''
                            } hover:bg-blue-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${selectedKabupatens.includes(kab) ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
                      >{kab}</button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedKabupatens.map(kab => (
                    <span key={kab} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {kab}
                      <button onClick={() => handleKabupatenSelect(kab)} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative company-filter">
                <label className="block text-sm font-medium mb-2">Perusahaan</label>
                <input type="text" placeholder="Cari perusahaan..." value={companySearch}
                  onChange={(e) => { setCompanySearch(e.target.value); setShowCompanyDropdown(true); }}
                  onFocus={() => { setShowCompanyDropdown(true); setHighlightedIndex(-1); }}
                  onKeyDown={(e) => handleKeyDown(e, 'company')}
                  className={`w-full p-3 rounded-lg ${inputBg} border ${borderColor} outline-none`}
                />
                {showCompanyDropdown && filteredCompanies.length > 0 && (
                  <div className={`absolute z-20 w-full mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                    {filteredCompanies.map((comp, index) => (
                      <button key={comp} onClick={() => handleCompanySelect(comp)}
                        className={`w-full text-left px-4 py-2 ${
                            index === highlightedIndex ? (darkMode ? 'bg-gray-600' : 'bg-blue-100') : ''
                            } hover:bg-blue-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${selectedCompanies.includes(comp) ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
                      >{comp}</button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCompanies.map(comp => (
                    <span key={comp} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {comp}
                      <button onClick={() => handleCompanySelect(comp)} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative prodi-filter">
                <label className="block text-sm font-medium mb-2">Program Studi</label>
                <input type="text" placeholder="Cari program studi..." value={prodiSearch}
                  onChange={(e) => { setProdiSearch(e.target.value); setShowProdiDropdown(true); }}
                  onFocus={() => { setShowProdiDropdown(true); setHighlightedIndex(-1); }}
                  onKeyDown={(e) => handleKeyDown(e, 'prodi')}
                  className={`w-full p-3 rounded-lg ${inputBg} border ${borderColor} outline-none`}
                />
                {showProdiDropdown && filteredProdi.length > 0 && (
                  <div className={`absolute z-20 w-full mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                    {filteredProdi.map((prodi, index) => (
                      <button key={prodi} onClick={() => handleProdiSelect(prodi)}
                        className={`w-full text-left px-4 py-2 ${
                            index === highlightedIndex ? (darkMode ? 'bg-gray-600' : 'bg-blue-100') : ''
                            } hover:bg-blue-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${selectedProdis.includes(prodi) ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
                      >{prodi}</button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProdis.map(prodi => (
                    <span key={prodi} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {prodi}
                      <button onClick={() => handleProdiSelect(prodi)} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urutkan</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full p-3 rounded-lg ${inputBg} border ${borderColor} outline-none`}
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="applicants">Pendaftar Terendah</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <div className={`${cardBg} rounded-xl p-2 inline-flex gap-2 shadow-md border ${borderColor}`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                }`}
            >
              <Briefcase className="w-5 h-5" />
              Semua Lowongan
            </button>
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'bookmarked'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                }`}
            >
              <Bookmark className="w-5 h-5" />
              Tersimpan ({bookmarkedJobs.length})
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {filteredJobs.length} Lowongan {activeTab === 'bookmarked' ? 'Tersimpan' : 'Tersedia'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`px-4 py-2 rounded-lg ${inputBg} border ${borderColor} outline-none`}
            >
              <option value={24}>24</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`${cardBg} rounded-xl p-6 shadow-md border ${borderColor} relative overflow-hidden`}
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="w-16 h-16 bg-gray-300/50 rounded-lg mb-4" />
                <div className="h-5 bg-gray-300/50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-300/40 rounded w-1/2 mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-300/40 rounded w-2/3" />
                  <div className="h-3 bg-gray-300/40 rounded w-1/2" />
                  <div className="h-3 bg-gray-300/40 rounded w-1/3" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="w-16 h-5 bg-gray-300/40 rounded-full" />
                  <div className="w-10 h-5 bg-gray-300/40 rounded-full" />
                </div>
                <div className="w-full h-2 bg-gray-300/40 rounded-full mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedJobs.map((job, i) => {
                const prodis = parseProdi(job.program_studi);
                const isBookmarked = bookmarkedJobs.includes(job.id_posisi);

                const peluangPersen = job.jumlah_terdaftar > 0
                  ? (job.jumlah_kuota / job.jumlah_terdaftar) * 100
                  : (job.jumlah_kuota > 0 ? 100 : 0);

                let namaPeluang;
                if (peluangPersen >= 75) {
                  namaPeluang = "Sangat Tinggi";
                } else if (peluangPersen >= 50) {
                  namaPeluang = "Tinggi";
                } else if (peluangPersen >= 25) {
                  namaPeluang = "Sedang";
                } else {
                  namaPeluang = "Rendah";
                }

                return (
                  <div
                    key={job.id_posisi}
                    className={`${cardBg} rounded-xl shadow-lg hover:shadow-xl transition-all p-6 cursor-pointer border ${borderColor} hover:border-blue-500 group flex flex-col justify-between h-full min-h-[400px] hover:scale-[1.03] hover:-translate-y-1.5`}
                    style={{ animation: `fadeIn 0.5s ease-out ${i * 75}ms backwards` }}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <img
                          src={
                            job.perusahaan.logo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              job.perusahaan.nama_perusahaan
                            )}&size=16&background=e5e7eb&color=6b7280`
                          }
                          alt={job.perusahaan.nama_perusahaan}
                          className="w-16 h-16 object-contain rounded-lg bg-gray-100"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              job.perusahaan.nama_perusahaan
                            )}&size=16&background=e5e7eb&color=6b7280`;
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(job.id_posisi);
                          }}
                          className={`p-2 rounded-lg transition-all ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : `bg-gray-100 text-gray-400 ${darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'hover:bg-gray-200'}`}`}
                          aria-label={isBookmarked ? 'Hapus dari simpanan' : 'Simpan lowongan'}
                        >
                          <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ minHeight: '2.5em' }}>
                        {job.posisi}
                      </h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-4 line-clamp-1`}>
                        {job.perusahaan.nama_perusahaan}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{job.perusahaan.nama_kabupaten}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>
                            {job.jumlah_terdaftar} / {job.jumlah_kuota} pendaftar
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-start content-start gap-2 mb-4" style={{ minHeight: '3.75rem' }}>
                        {prodis.slice(0, 2).map((prodi, idx) => (
                          <span
                            key={idx}
                            title={prodi.title}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full max-w-[130px] truncate"
                          >
                            {prodi.title}
                          </span>
                        ))}
                        {prodis.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap">
                            +{prodis.length - 2} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Peluang: <strong>{Math.round(peluangPersen)}%</strong> ({namaPeluang})
                      </p>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${job.jumlah_terdaftar / job.jumlah_kuota > 4
                              ? "bg-red-500"
                              : job.jumlah_terdaftar / job.jumlah_kuota > 2
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          style={{
                            width: `${Math.min(
                              job.jumlah_kuota > 0
                                ? (job.jumlah_terdaftar / job.jumlah_kuota) * 25
                                : 0,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 mb-4">
              <p className="text-sm text-gray-500">
                Menampilkan {paginatedJobs.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredJobs.length)} dari {filteredJobs.length} lowongan
              </p>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${inputBg} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 transition-all`}
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  {(() => {
                    const pages = [];
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, currentPage + 2);

                    if (totalPages > 5) {
                      if (currentPage < 4) {
                        endPage = 5;
                      }
                      if (currentPage > totalPages - 3) {
                        startPage = totalPages - 4;
                      }
                    }

                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className={`w-10 h-10 rounded-lg ${inputBg} hover:bg-blue-100 transition-all`}
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="dots1" className="px-1 text-gray-500">...</span>);
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-10 h-10 rounded-lg transition-all ${currentPage === i ? 'bg-blue-600 text-white' : `${inputBg} hover:bg-blue-100`
                            }`}
                          aria-current={currentPage === i ? 'page' : undefined}
                        >
                          {i}
                        </button>
                      );
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="dots2" className="px-1 text-gray-500">...</span>);
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-10 h-10 rounded-lg ${inputBg} hover:bg-blue-100 transition-all`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <div className="flex sm:hidden font-medium text-sm">
                  <span className={`px-4 py-2 rounded-lg ${inputBg} border ${borderColor}`}>
                    Halaman {currentPage} dari {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-2 rounded-lg ${inputBg} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 transition-all`}
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedJob(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={`${cardBg} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleUp`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48">
              {
                selectedJob.perusahaan.banner ? (
                  <img
                    src={selectedJob.perusahaan.banner}
                    alt="Banner Perusahaan"
                    className="w-full h-full object-cover rounded-t-2xl"
                    onError={(e) => {
                      const parent = e.target.parentNode;
                      e.target.style.display = 'none';
                      if (parent) {
                        parent.style.background = 'linear-gradient(to right, #3b82f6, #8b5cf6)';
                      }
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-t-2xl"
                    style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                  ></div>
                )
              }
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full shadow-lg hover:bg-black/60 transition-all z-10"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <img
                  src={
                    selectedJob.perusahaan?.logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedJob.perusahaan.nama_perusahaan
                    )}&background=e5e7eb&color=6b7280`
                  }
                  alt={selectedJob.perusahaan.nama_perusahaan}
                  className="w-20 h-20 object-contain rounded-lg border border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedJob.perusahaan.nama_perusahaan
                    )}&background=e5e7eb&color=6b7280`;
                  }}
                />
                <div className="flex-1">
                  <h2 id="modal-title" className="text-2xl font-bold mb-2">{selectedJob.posisi}</h2>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedJob.perusahaan.nama_perusahaan}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.perusahaan.nama_kabupaten}, {selectedJob.perusahaan.nama_provinsi}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(selectedJob.id_posisi)}
                  className={`p-3 rounded-lg transition-all ${bookmarkedJobs.includes(selectedJob.id_posisi)
                      ? 'bg-yellow-100 text-yellow-600'
                      : `bg-gray-100 text-gray-400 ${darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'hover:bg-gray-200'}`
                    }`}
                  aria-label={bookmarkedJobs.includes(selectedJob.id_posisi) ? 'Hapus dari simpanan' : 'Simpan lowongan'}
                >
                  <Bookmark
                    className="w-6 h-6"
                    fill={bookmarkedJobs.includes(selectedJob.id_posisi) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold">{selectedJob.jumlah_kuota || '-'}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Kuota</div>
                </div>
                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold">{selectedJob.jumlah_terdaftar || 0}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Terdaftar</div>
                </div>
                {(() => {
                  const peluangPersen = selectedJob.jumlah_terdaftar > 0
                    ? (selectedJob.jumlah_kuota / selectedJob.jumlah_terdaftar) * 100
                    : (selectedJob.jumlah_kuota > 0 ? 100 : 0);

                  let namaPeluang;
                  if (peluangPersen >= 75) {
                    namaPeluang = "Sangat Tinggi";
                  } else if (peluangPersen >= 50) {
                    namaPeluang = "Tinggi";
                  } else if (peluangPersen >= 25) {
                    namaPeluang = "Sedang";
                  } else {
                    namaPeluang = "Rendah";
                  }

                  return (
                    <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                      <Briefcase className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold">
                        {Math.round(peluangPersen)}%
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Peluang ({namaPeluang})
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Deskripsi Pekerjaan
                  </h3>
                  <div
                    className={`${inputBg} rounded-lg p-4 border ${borderColor} prose max-w-none ${darkMode ? 'prose-invert' : ''}`}
                    dangerouslySetInnerHTML={{ __html: selectedJob.deskripsi_posisi || '<p>Tidak ada deskripsi.</p>' }}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Program Studi yang Dibutuhkan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseProdi(selectedJob.program_studi).length > 0 ? parseProdi(selectedJob.program_studi).map((prodi, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium"
                      >
                        {prodi.title}
                      </span>
                    )) : (
                      <p className="text-sm text-gray-500">Tidak ada informasi program studi spesifik.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Tentang Perusahaan
                  </h3>
                  <div className={`${inputBg} rounded-lg p-4 border ${borderColor}`}>
                    <p className={`mb-3 ${!selectedJob.perusahaan.deskripsi_perusahaan
                        ? `italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                        : ''
                      }`}>
                      {selectedJob.perusahaan.deskripsi_perusahaan || 'Tidak ada deskripsi perusahaan.'}
                    </p>
                    <div className="space-y-2 text-sm border-t border-gray-200/50 pt-3 mt-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                        <div>
                          <p className="font-medium">Alamat</p>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{selectedJob.perusahaan.alamat}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDisclaimer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
        >
          <div
            className={`${cardBg} rounded-xl shadow-lg p-6 sm:p-8 relative max-w-2xl w-full animate-scaleUp`}
          >
            <button
              onClick={() => setShowDisclaimer(false)}
              className={`absolute top-4 right-4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all`}
              aria-label="Tutup disclaimer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h3 id="disclaimer-title" className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Disclaimer
              </h3>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`}>
                <p>
                  Selamat datang di <strong>NextStep</strong>! Platform ini dibuat untuk membantu Anda mencari dan memilih lowongan magang yang sesuai dengan minat, lokasi, dan keahlian Anda.
                </p>
                <p>
                  Seluruh data lowongan yang ditampilkan bersumber langsung dari situs resmi <strong>Kementerian Ketenagakerjaan Republik Indonesia (Kemnaker RI)</strong>.
                </p>
                <p className="text-xs italic mt-4 p-3 bg-gray-800 text-white dark:bg-gray-700/50 rounded-lg">
                  Harap dicatat bahwa website ini <strong className="font-bold">tidak berafiliasi</strong> secara resmi dengan Kemnaker RI dan dikembangkan semata-mata untuk tujuan edukasi serta mempermudah akses informasi lowongan magang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MagangHub;