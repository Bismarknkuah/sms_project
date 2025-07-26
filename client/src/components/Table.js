function Table({ columns, data, onEdit, onDelete }) {
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    const sorted = [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Data table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortConfig.key === col.key && (
                  <i className={`fas fa-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                )}
              </th>
            ))}
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index} className="border-t">
              {columns.map(col => (
                <td key={col.key} className="p-3 text-sm text-gray-600">{row[col.key]}</td>
              ))}
              <td className="p-3">
                <button
                  onClick={() => onEdit(row)}
                  className="btn bg-indigo-500 text-white px-2 py-1 rounded-md mr-2"
                  aria-label={`Edit ${row.name || 'item'}`}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => onDelete(row)}
                  className="btn bg-red-500 text-white px-2 py-1 rounded-md"
                  aria-label={`Delete ${row.name || 'item'}`}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="btn bg-gray-100 text-gray-600 px-3 py-1 rounded-md disabled:opacity-50"
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn bg-gray-100 text-gray-600 px-3 py-1 rounded-md disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}