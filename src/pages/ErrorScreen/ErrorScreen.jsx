import SvgImageError from "../../assets/error.svg";
import "../../App.css";

const ErrorScreen = () => {
    return (
        <div className="App">
            <img src={SvgImageError} alt="image" className="image-svg" />
            <p>
                We apologize for any inconvenience caused. Please go back or contact the
                admin if this persists
            </p>
        </div>
    );
};

export default ErrorScreen;