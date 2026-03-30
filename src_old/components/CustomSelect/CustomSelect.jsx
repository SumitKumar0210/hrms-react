import Select from "react-select";

/* -------------------- Styles -------------------- */
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "31px",           // Bootstrap sm
    height: "auto",
    lineHeight: 1.5,
    borderWidth: "1px",
    borderRadius: "2px",
    borderColor: "#dee2e6",  
    boxShadow: "none",
    borderColor: state.isFocused ? "#3c64f1" : base.borderColor,
    // "&:hover": {
    //   borderColor: "#0d6efd",
    // },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: "13px",
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "13px",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "13px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: "12px",
  }),
  option: (base) => ({
    ...base,
    fontSize: "13px",
  }),
};

/* -------------------- Component -------------------- */
const CustomSelect = ({
  isMulti = false,
  isSearchable = true,
  ...props
}) => {
  return (
    <Select
      isMulti={isMulti}
      isSearchable={isSearchable}
      styles={customSelectStyles}
      {...props}
    />
  );
};

export default CustomSelect;
