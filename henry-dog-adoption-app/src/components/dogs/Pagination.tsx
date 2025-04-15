import React from "react";
import classes from "./styles/Pagination.module.css";
import Button from "../ui/Button";
import Container from "../../components/ui/Container";

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
    if (page > 0) {
      setPage(page - 1);
    }
  };
  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  return (
    <Container>
      <div className={classes.pagination_container}>
        <Button
          onClickFunction={handlePrevious}
          variant="danger"
          disabled={page === 0}
        >
          Previous
        </Button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <Button
          onClickFunction={handleNext}
          variant="danger"
          disabled={page >= totalPages - 1}
        >
          Next
        </Button>
      </div>
    </Container>
  );
};

export default Pagination;
