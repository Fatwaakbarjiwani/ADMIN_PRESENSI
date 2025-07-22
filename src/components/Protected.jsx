import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PropTypes from "prop-types";

const Protected = ({ children, loginOnly = false }) => {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginOnly) {
      if (token) {
        navigate("/");
      }
    } else {
      if (!token) {
        navigate("/login");
      }
    }
  }, [token, navigate, loginOnly]);

  if (loginOnly) {
    if (token) return null;
    return children;
  }
  if (!token) return null;
  return children;
};

Protected.propTypes = {
  children: PropTypes.node.isRequired,
  loginOnly: PropTypes.bool,
};

export default Protected;
