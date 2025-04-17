import React from "react";
import classes from "./styles/Pagination.module.css";
import Button from "../ui/Button";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  setPage,
  totalPages,
}) => {
  const handlePrevious = () => {
    setPage(page - 1);
  };
  const handleNext = () => {
    setPage(page + 1);
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const siblingCount = 1;

    pageNumbers.push(1);

    const startPage = Math.max(2, page + 1 - siblingCount);
    const endPage = Math.min(totalPages - 1, page + 1 + siblingCount);

    if (startPage > 2) {
      pageNumbers.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return [...new Set(pageNumbers)];
  };

  const pageItems = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={classes.pagination_container}>
      <Button
        onClickFunction={handlePrevious}
        variant="secondary"
        disabled={page === 0}
      >
        Previous
      </Button>

      <div className={classes.page_numbers}>
        {pageItems.map((item, index) => {
          if (typeof item === "string") {
            return (
              <span key={`ellipsis-${index}`} className={classes.ellipsis}>
                {item}
              </span>
            );
          } else {
            const pageIndex = item - 1;
            return (
              <button
                key={item}
                onClick={() => handlePageClick(pageIndex)}
                className={`
                  ${classes.page_button}
                  ${page === pageIndex ? classes.active_page : ""}
                `}
                disabled={page === pageIndex}
              >
                {item}
              </button>
            );
          }
        })}
      </div>

      <Button
        onClickFunction={handleNext}
        variant="secondary"
        disabled={page >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
