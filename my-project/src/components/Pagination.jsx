// import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationNumbers = () => {
    let pages = [];
    const pageRange = 2;

    if (totalPages <= 3) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pages.push(1);

      if (currentPage > pageRange + 2) {
        pages.push("...");
      }

      let startPage = Math.max(2, currentPage - pageRange);
      let endPage = Math.min(totalPages - 1, currentPage + pageRange);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - (pageRange + 1)) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-4 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}  
        className="px-3 py-1 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
      >
        Prev
      </button>

      {getPaginationNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-3 py-1 text-gray-600">...</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
