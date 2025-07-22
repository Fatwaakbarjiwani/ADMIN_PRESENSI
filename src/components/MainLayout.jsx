import Sidebar from "./Sidebar";
import PropTypes from "prop-types";

const MainLayout = ({ children }) => {
  return (
    <div className="w-full flex">
      <Sidebar />
      <div className="w-full">{children}</div>
    </div>
  );
};
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
