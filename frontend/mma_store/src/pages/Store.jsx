import React, { useState, useEffect, useMemo } from "react";
import ModelCard from "../components/Store/ModelCard";
import {
    Search, SlidersHorizontal, PackageSearch, X,
    Package, Layers, AlertTriangle, ChevronDown,
    Download
} from "lucide-react";
import styles from "./Store.module.css";
import FilterModal from "../components/Store/FilterModal";
import { getModels, getCategories } from "../services/StoreService";

const Store = () => {
    const [models, setModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedModels, setSelectedModels] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [sortBy, setSortBy] = useState("default");
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    /* ─── Load Data ─── */
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        Promise.all([getModels(), getCategories()])
            .then(([modelsData]) => {
                if (!isMounted) return;
                setModels(modelsData);

                const grouped = {};
                modelsData.forEach((item) => {
                    const category = item.category;
                    const modelName = item.model;
                    if (!grouped[category]) grouped[category] = [];
                    if (modelName && !grouped[category].includes(modelName)) {
                        grouped[category].push(modelName);
                    }
                });

                const formatted = Object.keys(grouped).map((cat) => ({
                    name: cat,
                    models: grouped[cat],
                }));

                setCategories(formatted);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error("Error loading data:", err);
                setError("Failed to load models. Please try again later.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    /* ─── Filter + Sort ─── */
    const filteredModels = useMemo(() => {
        let result = models.filter((model) => {
            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(model.category);

            const modelMatch =
                selectedModels.length === 0 ||
                selectedModels.includes(model.model);

            const query = searchQuery.toLowerCase().trim();
            const searchMatch =
                !query ||
                model.model?.toLowerCase().includes(query) ||
                model.category?.toLowerCase().includes(query) ||
                model.spare_type?.toLowerCase().includes(query);

            return categoryMatch && modelMatch && searchMatch;
        });

        if (sortBy === "name_asc") {
            result = [...result].sort((a, b) => (a.model || "").localeCompare(b.model || ""));
        } else if (sortBy === "name_desc") {
            result = [...result].sort((a, b) => (b.model || "").localeCompare(a.model || ""));
        } else if (sortBy === "stock_high") {
            result = [...result].sort((a, b) => Number(b.onhand || 0) - Number(a.onhand || 0));
        } else if (sortBy === "stock_low") {
            result = [...result].sort((a, b) => Number(a.onhand || 0) - Number(b.onhand || 0));
        }

        return result;
    }, [models, selectedCategories, selectedModels, searchQuery, sortBy]);

    /* ─── Stat summary ─── */
    const stats = useMemo(() => ({
        total: models.length,
        categories: [...new Set(models.map(m => m.category))].length,
        lowStock: models.filter(m => Number(m.onhand) <= 3).length,
    }), [models]);

    const activeFilterCount = selectedCategories.length + selectedModels.length;

    const handleExportExcel = () => {
        const rows = filteredModels.map((model) => ({
            Category: model.category || "",
            Model: model.model || "",
            Type: model.spare_type || "",
            "Part Number": model.part_number || "",
            "On Hand": model.onhand || 0,
            "Minimum Stock": model.minimum_stock || "",
            Price: model.price ? Number(model.price).toFixed(2) : "",
            Description: model.description || "",
        }));

        const header = Object.keys(rows[0] || {}).join(",") + "\n";
        const csv = rows.reduce((acc, row) => {
            const line = Object.values(row)
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",");
            return acc + line + "\n";
        }, header);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `store-export-${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const sortOptions = [
        { value: "default", label: "Default" },
        { value: "name_asc", label: "A → Z" },
        { value: "name_desc", label: "Z → A" },
        { value: "stock_high", label: "Stock: High → Low" },
        { value: "stock_low", label: "Stock: Low → High" },
    ];

    /* ─── Loading State ─── */
    if (loading) {
        return (
            <div className={styles.flexCenter}>
                <div className={styles.loadingRing}>
                    <div /><div /><div /><div />
                </div>
                <p className={styles.loadingText}>Loading spare parts...</p>
            </div>
        );
    }

    /* ─── Error State ─── */
    if (error) {
        return (
            <div className={styles.flexCenter}>
                <div className={styles.errorMessage}>
                    <AlertTriangle size={32} className={styles.errorIcon} />
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className={styles.btnRetry}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} onClick={() => setShowSortDropdown(false)}>
            {/* Ambient Glows */}
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />
            <div className={styles.bgGlow3} />

            {/* ─── Hero ─── */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>


                    {/* Inline Stats */}
                    <div className={styles.heroStats}>
                        <div className={styles.heroStat}>
                            <span className={styles.heroStatValue}>{stats.total}</span>
                            <span className={styles.heroStatLabel}>Total Parts</span>
                        </div>
                        <div className={styles.heroStatDivider} />
                        <div className={styles.heroStat}>
                            <span className={styles.heroStatValue}>{stats.categories}</span>
                            <span className={styles.heroStatLabel}>Categories</span>
                        </div>
                        <div className={styles.heroStatDivider} />
                        <div className={styles.heroStat}>
                            <span className={`${styles.heroStatValue} ${stats.lowStock > 0 ? styles.statRed : ""}`}>
                                {stats.lowStock}
                            </span>
                            <span className={styles.heroStatLabel}>Low Stock</span>
                        </div>
                    </div>
                </div>
                <div className={styles.heroDecor} />
            </section>

            {/* ─── Controls ─── */}
            <div className={styles.controls}>
                {/* Search */}
                <div className={styles.searchBar}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        id="spare-search"
                        type="text"
                        placeholder="Search model, category, type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchQuery && (
                        <button className={styles.clearSearch} onClick={() => setSearchQuery("")} title="Clear search">
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className={styles.controlsRight}>
                    {/* Sort Dropdown */}
                    <div
                        className={styles.sortWrapper}
                        onClick={(e) => { e.stopPropagation(); setShowSortDropdown(prev => !prev); }}
                    >
                        <button id="spare-sort-btn" className={styles.sortBtn}>
                            <Layers size={15} />
                            <span>{sortOptions.find(o => o.value === sortBy)?.label || "Sort"}</span>
                            <ChevronDown size={14} className={showSortDropdown ? styles.chevronOpen : ""} />
                        </button>
                        {showSortDropdown && (
                            <div className={styles.sortDropdown}>
                                {sortOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`${styles.sortOption} ${sortBy === opt.value ? styles.sortOptionActive : ""}`}
                                        onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Button */}
                    <button
                        id="spare-filter-btn"
                        onClick={() => setShowFilter(true)}
                        className={`${styles.filterBtn} ${activeFilterCount > 0 ? styles.filterBtnActive : ""}`}
                    >
                        <SlidersHorizontal size={15} />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className={styles.filterBadge}>{activeFilterCount}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className={styles.exportBtn}
                        title="Export current table to Excel"
                    >
                        <Download size={15} />
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {/* Active Filters Strip */}
            {activeFilterCount > 0 && (
                <div className={styles.activeFiltersStrip}>
                    <span className={styles.stripLabel}>Active:</span>
                    {selectedCategories.map(cat => (
                        <span key={cat} className={styles.filterChip}>
                            {cat}
                            <button onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}>
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                    {selectedModels.map(mdl => (
                        <span key={mdl} className={`${styles.filterChip} ${styles.filterChipModel}`}>
                            {mdl}
                            <button onClick={() => setSelectedModels(prev => prev.filter(m => m !== mdl))}>
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                    <button
                        className={styles.clearAllChip}
                        onClick={() => { setSelectedCategories([]); setSelectedModels([]); }}
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Result count */}
            <div className={styles.resultCount}>
                Showing <strong>{filteredModels.length}</strong> of <strong>{models.length}</strong> parts
            </div>

            {/* ─── Model Grid ─── */}
            <div className={styles.modelGrid}>
                {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                        <ModelCard key={model.id} model={model} />
                    ))
                ) : (
                    <div className={styles.noResults}>
                        <div className={styles.noResultsIconWrap}>
                            <PackageSearch size={36} />
                        </div>
                        <h3 className={styles.noResultsTitle}>No parts found</h3>
                        <p className={styles.noResultsDesc}>
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                        <button
                            className={styles.btnClearFilters}
                            onClick={() => {
                                setSelectedCategories([]);
                                setSelectedModels([]);
                                setSearchQuery("");
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Filter Modal ─── */}
            <FilterModal
                show={showFilter}
                onClose={() => setShowFilter(false)}
                categories={categories}
                models={models}
                selectedCategories={selectedCategories}
                selectedModels={selectedModels}
                setSelectedCategories={setSelectedCategories}
                setSelectedModels={setSelectedModels}
            />
        </div>
    );
};

export default Store;