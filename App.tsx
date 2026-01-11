
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, ChevronDown, MoreVertical, ArrowUpDown, Tag, Check, MousePointer2, Sigma, Info, AlertCircle, HelpCircle } from 'lucide-react';
import { generateMockRows, COLUMNS } from './data/mock';
import { TableRow, SelectionState, AggregationFunction } from './types';
import { calculateStats } from './utils/aggregations';

export default function App() {
  const [rows] = useState<TableRow[]>(generateMockRows(50));
  const [selectedCells, setSelectedCells] = useState<SelectionState[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [activeAggregations, setActiveAggregations] = useState<AggregationFunction[]>(['sum', 'avg', 'count']);
  
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCellClick = useCallback((rowId: string, columnId: string, event: React.MouseEvent) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
        setSelectedCells(prev => {
            const exists = prev.find(s => s.rowId === rowId && s.columnId === columnId);
            if (exists) return prev.filter(s => !(s.rowId === rowId && s.columnId === columnId));
            return [...prev, { rowId, columnId }];
        });
    } else {
        setSelectedCells([{ rowId, columnId }]);
    }
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const lower = searchTerm.toLowerCase();
    return rows.filter(r => 
        r.name.toLowerCase().includes(lower) ||
        r.company.name.toLowerCase().includes(lower) ||
        r.manager.name.toLowerCase().includes(lower)
    );
  }, [rows, searchTerm]);

  // UNIT CONSISTENCY LOGIC:
  // Age & Experience share the "years" unit. Score is "percent".
  const stats = useMemo(() => {
    const isSelectionMode = selectedCells.length > 0;
    
    if (isSelectionMode) {
      const selectedColIds = Array.from(new Set(selectedCells.map(s => s.columnId)));
      const selectedUnits = Array.from(new Set(
        selectedColIds.map(id => COLUMNS.find(c => c.id === id)?.unit).filter(Boolean)
      ));

      // Mixed units is only an issue if we have more than one distinct unit type (e.g., years AND percent)
      const isMixedUnits = selectedUnits.length > 1;

      const values = selectedCells.map(s => {
        const row = rows.find(r => r.id === s.rowId);
        return row ? (row as any)[s.columnId] : null;
      });

      const baseStats = calculateStats(values);
      
      return { 
        ...baseStats, 
        scope: 'SELECTED',
        isMixedUnits,
        activeUnit: isMixedUnits ? 'Mixed' : (selectedUnits[0] || 'N/A'),
        sum: isMixedUnits ? null : baseStats.sum,
        avg: isMixedUnits ? null : baseStats.avg,
      };
    } else {
      // Default Filter-based aggregation on Age column
      const visibleAgeValues = filteredRows.map(r => r.age);
      return { 
        ...calculateStats(visibleAgeValues), 
        scope: searchTerm ? 'FILTERED' : 'TOTAL',
        isMixedUnits: false,
        activeUnit: 'years'
      };
    }
  }, [selectedCells, rows, filteredRows, searchTerm]);

  const toggleAggregation = (fn: AggregationFunction) => {
    setActiveAggregations(prev => 
      prev.includes(fn) ? prev.filter(a => a !== fn) : [...prev, fn]
    );
  };

  const getCellClassName = (rowId: string, columnId: string, align: string = "text-left") => {
    const isSelected = selectedCells.some(s => s.rowId === rowId && s.columnId === columnId);
    return `p-2 border-r border-slate-100 cursor-pointer select-none transition-all relative ${align} ${
      isSelected 
        ? 'bg-blue-50 ring-2 ring-inset ring-blue-600 z-10' 
        : 'hover:bg-slate-50'
    }`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-[13px]">
      {/* Header */}
      <header className="px-4 py-3 flex flex-col gap-3 border-b border-slate-200 shadow-sm z-30 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search (e.g. Filter by Name or Company)..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-1 overflow-auto relative bg-slate-50/20">
        <table className="w-full border-collapse table-fixed min-w-[950px]">
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-300">
            <tr>
              <th className="w-12 p-2 border-r border-slate-200 bg-slate-50"></th>
              {COLUMNS.map((col) => (
                <th key={col.id} style={{ width: col.width }} className="p-2 text-left font-bold text-slate-500 border-r border-slate-200 uppercase text-[10px] tracking-widest whitespace-nowrap">
                  <div className="flex items-center justify-between">
                    {col.label}
                    {col.unit && <span className="text-[8px] text-slate-300">({col.unit})</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 group">
                <td className="p-2 text-center border-r border-slate-100 bg-slate-50/30 text-[10px] text-slate-400">
                  {row.id.split('-')[1]}
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'name', e)} className={getCellClassName(row.id, 'name')}>
                  <span className="font-semibold text-slate-900">{row.name}</span>
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'external', e)} className={getCellClassName(row.id, 'external', 'text-center')}>
                  <div className={`w-2 h-2 mx-auto rounded-full ${row.external ? 'bg-green-500 shadow-sm' : 'bg-slate-300'}`}></div>
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'age', e)} className={getCellClassName(row.id, 'age', 'text-right font-mono text-slate-600')}>
                  {row.age}
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'experience', e)} className={getCellClassName(row.id, 'experience', 'text-right font-mono text-slate-600')}>
                  {row.experience}
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'score', e)} className={getCellClassName(row.id, 'score', 'text-right font-mono text-blue-600')}>
                  {row.score}%
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'birthday', e)} className={getCellClassName(row.id, 'birthday', 'text-slate-500')}>
                  {row.birthday}
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'manager', e)} className={getCellClassName(row.id, 'manager')}>
                  <span className="text-blue-600 underline underline-offset-2 decoration-blue-200">{row.manager.name}</span>
                </td>
                <td onClick={(e) => handleCellClick(row.id, 'company', e)} className={getCellClassName(row.id, 'company')}>
                  <span className="text-slate-700 truncate">{row.company.icon} {row.company.name}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* PDR-Compliant Footer */}
      <footer className="h-10 bg-slate-900 flex items-center px-4 text-[12px] text-slate-300 gap-6 font-medium z-40 select-none shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
            <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              stats.scope === 'SELECTED' ? 'bg-blue-600 text-white shadow-lg' : 
              stats.scope === 'FILTERED' ? 'bg-fuchsia-600 text-white' : 
              'bg-slate-700 text-slate-300'
            }`}>
              {stats.scope}
            </div>
            
            {stats.isMixedUnits ? (
              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Mixed Units (Blocked Math)</span>
              </div>
            ) : (
              <span className="text-slate-500 font-normal truncate opacity-80">
                {stats.scope === 'SELECTED' ? `Compatible Unit: ${stats.activeUnit}` : `Default Target: Age (${stats.activeUnit})`}
              </span>
            )}
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex gap-4 pr-4 border-r border-slate-700">
                {activeAggregations.includes('count') && (
                  <div className="flex gap-1.5 items-center group cursor-help">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Count</span>
                    <span className="text-white font-bold tabular-nums">{stats.count}</span>
                  </div>
                )}
            </div>

            <div className="flex items-center gap-5">
                {activeAggregations.includes('sum') && (
                  <div className="flex gap-1.5 items-center transition-opacity duration-300">
                    <span className="text-blue-400 text-[10px] uppercase font-bold tracking-wider">Sum</span>
                    <span className={`font-bold tabular-nums transition-colors ${stats.isMixedUnits ? 'text-slate-700' : 'text-white'}`}>
                      {stats.isMixedUnits ? '—' : stats.sum ?? '0'}
                    </span>
                  </div>
                )}
                {activeAggregations.includes('avg') && (
                  <div className="flex gap-1.5 items-center transition-opacity duration-300">
                    <span className="text-blue-400 text-[10px] uppercase font-bold tracking-wider">Avg</span>
                    <span className={`font-bold tabular-nums transition-colors ${stats.isMixedUnits ? 'text-slate-700' : 'text-white'}`}>
                      {stats.isMixedUnits ? '—' : stats.avg ?? '0'}
                    </span>
                  </div>
                )}
            </div>
        </div>
        
        <div className="relative" ref={configRef}>
            <button 
                onClick={() => setShowConfig(!showConfig)} 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${showConfig ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-slate-800 text-slate-400'}`}
            >
                <Sigma className="w-3.5 h-3.5" />
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`} />
            </button>

            {showConfig && (
                <div className="absolute bottom-11 right-0 w-64 bg-white shadow-2xl rounded-xl border border-slate-200 py-1.5 z-50 text-slate-900 animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-4 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 mb-1 flex items-center justify-between">
                        Configuration
                        <HelpCircle className="w-3 h-3" />
                    </div>
                    {(['sum', 'avg', 'min', 'max', 'count', 'values'] as AggregationFunction[]).map((fn) => (
                        <button key={fn} onClick={() => toggleAggregation(fn)} className="w-full flex items-center justify-between px-4 py-2 hover:bg-blue-50 text-left group">
                            <span className={`capitalize text-[13px] ${activeAggregations.includes(fn) ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                              {fn === 'avg' ? 'Average' : fn === 'values' ? 'Non-Empty' : fn}
                            </span>
                            {activeAggregations.includes(fn) && <Check className="w-4 h-4 text-blue-600 stroke-[3px]" />}
                        </button>
                    ))}
                    <div className="m-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                      <p className="text-[10px] text-blue-800 leading-snug">
                        <strong>Demo Tip:</strong> Try selecting cells from both <strong>Age</strong> and <strong>Exp</strong>. They share the 'Years' unit, so they sum together. Selecting <strong>Score</strong> will disable math to ensure data integrity.
                      </p>
                    </div>
                </div>
            )}
        </div>
      </footer>
    </div>
  );
}
