import { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { X, Filter } from "lucide-react";
// import PropTypes from 'prop-types';

const TableFilter = ({
  columns = [],
  columnTypes = {},
  filters = [],
  onApplyFilter = () => {},
  onClearColumnFilter = () => {},
  onResetFilters = () => {},
}) => {
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterInput, setFilterInput] = useState("");
  const [filterCondition, setFilterCondition] = useState("contains");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const filterButtonRefs = useRef({});

  const getConditionOptions = (columnName) => {
    const type = columnTypes[columnName] || "string";
    
    if (type === "string") {
      return [
        { value: "contains", label: "Contains" },
        { value: "notcontains", label: "Not Contains" },
        { value: "startswith", label: "Starts With" },
        { value: "endswith", label: "Ends With" }
      ];
    } else {
      return [
        { value: "equals", label: "Equals" },
        { value: "notequals", label: "Not Equals" },
      ];
    }
  };

  const handleAddFilter = (columnName, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setPopupPosition({
      top: buttonRect.bottom + scrollTop + 5,
      left: buttonRect.left + scrollLeft - 100
    });
    
    setActiveFilterColumn(columnName);
    setFilterInput("");
    setFilterCondition(columnTypes[columnName] === "number" ? "equals" : "contains");
  };

  const applyFilter = () => {
    if (!filterInput.trim() || !activeFilterColumn) return;

    const newFilter = {
      columnName: activeFilterColumn,
      condition: filterCondition,
      value: filterInput.trim(),
    };

    onApplyFilter(newFilter);
    setActiveFilterColumn(null);
  };

  const handleClickOutside = (event) => {
    if (
      activeFilterColumn && 
      !event.target.closest(".filter-popup") && 
      !event.target.closest(".filter-button")
    ) {
      setActiveFilterColumn(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeFilterColumn]);

  return (
    <>
      {/* Active Filters Display */}
      {filters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 mb-4">
          {filters.map((filter, index) => (
            <div 
              key={index} 
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
            >
              <span className="font-medium">{filter.columnName}</span>
              <span className="text-sm">{filter.condition}</span>
              <span className="font-semibold">"{filter.value}"</span>
              <button 
                onClick={() => onClearColumnFilter(filter.columnName)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
                title="Clear this filter"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Buttons in Table Headers */}
      {columns.map((column) => (
        <button
          key={column}
          ref={(el) => filterButtonRefs.current[column] = el}
          onClick={(e) => handleAddFilter(column, e)}
          className={`filter-button p-1 rounded ${
            filters.some(f => f.columnName === column) ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-0'
          }`}
        >
          <Filter size={16} />
        </button>
      ))}

      {/* Filter Popup */}
      {activeFilterColumn && (
        <div className="absolute inset-0 bg-transparent z-50">
          <div 
            className="filter-popup absolute bg-white p-4 rounded-lg shadow-xl w-80 border"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold">
                Filter {activeFilterColumn}
              </h3>
              <button 
                onClick={() => setActiveFilterColumn(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <Select
                value={getConditionOptions(activeFilterColumn).find(opt => opt.value === filterCondition)}
                onChange={(selected) => setFilterCondition(selected.value)}
                options={getConditionOptions(activeFilterColumn)}
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type={columnTypes[activeFilterColumn] === "number" ? "number" : "text"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder={`Enter value`}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  onClearColumnFilter(activeFilterColumn);
                  setActiveFilterColumn(null);
                }}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
              >
                Clear
              </button>
              <button
                onClick={applyFilter}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableFilter;