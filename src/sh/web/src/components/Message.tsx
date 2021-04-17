import styles from './Message.module.css';

export enum MessageType {
    Url,
    Err,
}

export default function Message({
    type,
    value,
}: {
    type: MessageType;
    value: string;
}) {
    if (type === MessageType.Url) {
        return (
            <a href={value}>
                <h3 className={`${styles.h3} ${styles.url}`}>{value}</h3>
            </a>
        );
    }

    if (type === MessageType.Err) {
        return <h3 className={`${styles.h3} ${styles.err}`}>{value}</h3>;
    }

    return <></>;
}
