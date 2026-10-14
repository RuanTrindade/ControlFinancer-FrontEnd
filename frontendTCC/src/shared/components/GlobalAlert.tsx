import { BiCheckCircle, BiError, BiErrorCircle, BiInfoCircle, BiX } from "react-icons/bi";

import { useAlert } from "../../context/AlertContext";

import "../styles/globalAlert.css";

export default function GlobalAlert() {
    const { alert, closeAlert } = useAlert();

    if (!alert) {
        return null;
    }

    const currentAlert = alert;

    function renderIcon() {
        switch (currentAlert.type) {
            case "success":
                return <BiCheckCircle />;

            case "warning":
                return <BiError />;

            case "error":
                return <BiErrorCircle />;

            case "info":
                return <BiInfoCircle />;

            default:
                return <BiInfoCircle />;
        }
    }

    return (
        <div className="global-alert-overlay" onMouseDown={closeAlert}>
            <div
                className={`
                    global-alert
                    global-alert-${currentAlert.type}
                `}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="global-alert-icon">{renderIcon()}</div>

                <div className="global-alert-content">
                    <h3>{currentAlert.title}</h3>

                    <p>{currentAlert.message}</p>
                </div>

                <button
                    type="button"
                    className="global-alert-close"
                    onClick={closeAlert}
                    aria-label="Fechar alerta"
                >
                    <BiX />
                </button>

                <div className="global-alert-actions">
                    <button type="button" className="global-alert-button" onClick={closeAlert}>
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}
