import styles from './RadioButton.module.css';

export default function RadioButton({
    children,
    name,
    value,
    onChange,
    checked,
}: any) {
    return (
        <label className={styles.btn}>
            <input
                type="radio"
                name={name}
                value={value}
                onChange={onChange}
                checked={checked}
            />
            {children}
        </label>
    );
}
