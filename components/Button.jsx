import styled from "styled-components";

const ButtonWrapper = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;

  transition: all 0.2s ease;
  cursor: pointer;

  ${(props) =>
    props.$variant === "primary" &&
    `
    background-color: #2D5BE3;
    color: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    &:hover {
      background-color: #2448b8;
      box-shadow: 0 4px 10px rgba(45, 91, 227, 0.2);
    }

    &:active {
      transform: scale(0.98);
    }
  `}

  ${(props) =>
    props.$variant === "secondary" &&
    `
    background: transparent;
    color: #111827;
    border: 1px solid #dadada;

    &:hover {
      background-color: #F3F4F6;
    }

    &:active {
      transform: scale(0.98);
    }
  `}
`;

const Button = ({ variant = "primary", children, ...props }) => {
  return (
    <ButtonWrapper $variant={variant} {...props}>
      {children}
    </ButtonWrapper>
  );
};

export default Button;