import styles from './styles.module.css';

export const PageUnderConstruction = () => {
    return <div className={styles.construction__Page__Container}>
        {/* {
            showProductView && <img src={dowellLogo} alt="dowell" className="logo" />
        } */}
        <img src='./PageUnderConstruction.jpg' alt='page under construction' />
        {/* {
            showProductView && <>
                <h2>Product currently under maintenance</h2>
                <p>We apologize for any inconvenience caused</p>
            </>
        } */}
    </div>
}

