import React, { useState, useMemo } from 'react';

export default function ModelYieldTable({ models = [] }) {
  const [filters, setFilters] = useState({
    phase: '',
    product: '',
    model: '',
    station: '',
    yield_pct: '' // เพิ่มสเตตัสสำหรับกรอง Yield
  });

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // ฟังก์ชันกรองข้อมูลอัจฉริยะ (รองรับ > 50, < 95, >= 90)
  const filteredModels = useMemo(() => {
    return models.filter(item => {
      // 1. กรองคอลัมน์ตัวหนังสือปกติ
      const matchPhase = (item.phase ?? '').toLowerCase().includes(filters.phase.toLowerCase());
      const matchProduct = (item.product ?? '').toLowerCase().includes(filters.product.toLowerCase());
      const matchModel = (item.model ?? '').toLowerCase().includes(filters.model.toLowerCase());
      const matchStation = (item.test_function ?? '').toLowerCase().includes(filters.station.toLowerCase());
      
      // 2. กรองคอลัมน์ Yield ด้วยเครื่องหมายทางคณิตศาสตร์
      let matchYield = true;
      const yieldInput = filters.yield_pct.trim();

      if (yieldInput) {
        // ใช้ Regex แยกเครื่องหมาย (เช่น >, <, >=, <=) ออกจากตัวเลข
        const match = yieldInput.match(/^([><]=?|=)?\s*([0-9.]+)?$/);
        
        if (match) {
          const operator = match[1] ?? '='; // ถ้าไม่พิมพ์เครื่องหมาย ให้มองว่าเป็น = โดยอัตโนมัติ
          const targetValue = parseFloat(match[2]);
          const currentYield = parseFloat(item.yield_pct);

          if (!isNaN(targetValue) && !isNaN(currentYield)) {
            switch (operator) {
              case '>':  matchYield = currentYield > targetValue; break;
              case '<':  matchYield = currentYield < targetValue; break;
              case '>=': matchYield = currentYield >= targetValue; break;
              case '<=': matchYield = currentYield <= targetValue; break;
              case '=':  matchYield = currentYield === targetValue; break;
              default:   matchYield = true;
            }
          }
        }
      }

      return matchPhase && matchProduct && matchModel && matchStation && matchYield;
    });
  }, [models, filters]);

  if (!models || models.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>ไม่มีข้อมูล Model ในสัปดาห์ที่แล้ว</div>;
  }

  const headerInputStyle = {
    width: '100%',
    padding: '6px 8px',
    marginTop: '6px',
    background: '#111827',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#f8fafc',
    fontSize: '12px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  return (
    <div style={{ overflowX: 'auto', marginTop: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px', color: '#94a3b8', fontSize: '12px' }}>
        แสดง {filteredModels.length} รายการ จากทั้งหมด {models.length} รายการ
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8' }}>
            <th style={{ padding: '12px 8px', minWidth: '100px' }}>
              <div>Phase</div>
              <input type="text" placeholder="🔍 Phase..." value={filters.phase} onChange={(e) => handleFilterChange('phase', e.target.value)} style={headerInputStyle} />
            </th>
            <th style={{ padding: '12px 8px', minWidth: '100px' }}>
              <div>Product</div>
              <input type="text" placeholder="🔍 Product..." value={filters.product} onChange={(e) => handleFilterChange('product', e.target.value)} style={headerInputStyle} />
            </th>
            <th style={{ padding: '12px 8px', minWidth: '140px' }}>
              <div>Model</div>
              <input type="text" placeholder="🔍 Model..." value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} style={headerInputStyle} />
            </th>
            <th style={{ padding: '12px 8px', minWidth: '110px' }}>
              <div>Station</div>
              <input type="text" placeholder="🔍 Station..." value={filters.station} onChange={(e) => handleFilterChange('station', e.target.value)} style={headerInputStyle} />
            </th>
            
            {/* คอลัมน์ตัวเลขเว้นไว้ปกติตามเดิม */}
            <th style={{ padding: '12px 8px', textAlign: 'right', verticalAlign: 'top' }}>Input</th>
            <th style={{ padding: '12px 8px', textAlign: 'right', verticalAlign: 'top' }}>Output</th>
            
            {/* คอลัมน์ Yield (%) ที่เพิ่มช่องกรองคณิตศาสตร์ */}
            <th style={{ padding: '12px 8px', textAlign: 'right', minWidth: '110px' }}>
              <div style={{ textAlign: 'right' }}>Yield (%)</div>
              <input
                type="text"
                placeholder="Ex. <95"
                value={filters.yield_pct}
                onChange={(e) => handleFilterChange('yield_pct', e.target.value)}
                style={{ ...headerInputStyle, textAlign: 'right' }} // จัดข้อความชิดขวาให้สวยงามเข้ากับตัวเลข
              />
            </th>
          </tr>
        </thead>
        
        <tbody>
          {filteredModels.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                🔍 ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
              </td>
            </tr>
          ) : (
            filteredModels.map((item, index) => {
              const isLowYield = Number(item.yield_pct) < 95.0;
              return (
                <tr key={index} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px 8px' }}>{item.phase}</td>
                  <td style={{ padding: '12px 8px' }}>{item.product}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{item.model}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {item.test_function}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>{Number(item.input).toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>{Number(item.output).toLocaleString()}</td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'right', 
                    fontWeight: 'bold', 
                    color: isLowYield ? '#ef4444' : '#10b981'
                  }}>
                    {item.yield_pct}%
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}