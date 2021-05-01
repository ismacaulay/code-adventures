import { useState } from 'react';
import './App.css';
import Message, { MessageType } from './components/Message';
import RadioButton from './components/RadioButton';
import { Duration } from './types';
import { requestShortUrl } from './utils/network';
import { validateURL } from './utils/url';

function App() {
    const [duration, setDuration] = useState(Duration.Single);
    const [long, setLong] = useState('');

    const [inputErr, setInputErr] = useState(false);
    const [message, setMessage] = useState<
        { value: string; type: MessageType } | undefined
    >(undefined);

    function onInputChange(e: any) {
        setInputErr(false);
        setMessage(undefined);
        setLong(e.target.value);
    }

    function onSubmit(e: any) {
        e.preventDefault();

        if (!long) {
            setInputErr(true);
            setMessage({
                type: MessageType.Err,
                value: 'Please specify a url.',
            });
            return;
        }

        const url = validateURL(long);
        if (!url) {
            setInputErr(true);
            setMessage({
                type: MessageType.Err,
                value: 'Invalid url, please try another.',
            });
            return;
        }

        setInputErr(false);
        setMessage(undefined);
        requestShortUrl(url, duration)
            .then((short) => {
                setMessage({
                    type: MessageType.Url,
                    value: short,
                });
            })
            .catch(() => {
                setMessage({
                    type: MessageType.Err,
                    value:
                        'An error occurred creating the short url. Please try again.',
                });
            });
    }

    function onDurationChange(e: any) {
        setInputErr(false);
        setMessage(undefined);
        setDuration(e.target.value);
    }

    return (
        <div>
            <div className="container">
                <h2 className="header">sh - a url shortener</h2>
                <div className="form-container">
                    <form onSubmit={onSubmit}>
                        <input
                            className={
                                inputErr ? 'input-lng input-err' : 'input-lng'
                            }
                            type="text"
                            onChange={onInputChange}
                        />
                        <button className="btn" type="submit">
                            shorten
                        </button>
                        <div className="radio-container">
                            <RadioButton
                                name="duration"
                                value={Duration.Single}
                                onChange={onDurationChange}
                                checked={duration === Duration.Single}
                            >
                                single use
                            </RadioButton>
                            <RadioButton
                                name="duration"
                                value={Duration.Hour}
                                onChange={onDurationChange}
                                checked={duration === Duration.Hour}
                            >
                                one hour
                            </RadioButton>
                            <RadioButton
                                name="duration"
                                value={Duration.Day}
                                onChange={onDurationChange}
                                checked={duration === Duration.Day}
                            >
                                one day
                            </RadioButton>
                        </div>
                    </form>
                </div>

                {message && (
                    <Message type={message.type} value={message.value} />
                )}
            </div>
        </div>
    );
}

export default App;
