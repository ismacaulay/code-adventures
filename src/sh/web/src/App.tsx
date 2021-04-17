import { useState } from 'react';
import './App.css';

import { requestShortUrl } from './network';
import { Duration } from './types';
import { validateUrl } from './utils';

function App() {
    const [duration, setDuration] = useState(Duration.Single);
    const [long, setLong] = useState('');
    const [shortened, setShortened] = useState<string | undefined>(undefined);

    function onInputChange(e: any) {
        if (shortened) {
            setShortened(undefined);
        }

        setLong(e.target.value);
    }

    function onSubmit(e: any) {
        e.preventDefault();

        if (!long) {
            // TODO: handle error
        }

        if (!validateUrl(long)) {
            // TODO: handle error
        }

        requestShortUrl(long, duration)
            .then((short) => {
                setShortened(short);
            })
            .catch(() => {
                // TODO: handle errors
            });
    }

    function onDurationChange(e: any) {
        setDuration(e.target.value);
    }

    return (
        <div>
            <div className="container">
                <h2 className="header">sh - a url shortener</h2>
                <div className="form-container">
                    <form onSubmit={onSubmit}>
                        <input
                            className="input-lng"
                            type="text"
                            onChange={onInputChange}
                        />
                        <button className="btn" type="submit">
                            shorten
                        </button>
                        <div className="radio-container">
                            <label className="radio-grp">
                                <input
                                    type="radio"
                                    name="duration"
                                    value={Duration.Single}
                                    onChange={onDurationChange}
                                    checked={duration === Duration.Single}
                                />
                                single use
                            </label>
                            <label className="radio-grp">
                                <input
                                    type="radio"
                                    name="duration"
                                    value={Duration.Hour}
                                    onChange={onDurationChange}
                                    checked={duration === Duration.Hour}
                                />
                                one hour
                            </label>
                            <label className="radio-grp">
                                <input
                                    type="radio"
                                    name="duration"
                                    value={Duration.Day}
                                    onChange={onDurationChange}
                                    checked={duration === Duration.Day}
                                />
                                one day
                            </label>
                        </div>
                    </form>
                </div>
                {shortened && (
                    <a className="url-link" href={shortened}>
                        <h3 className="url">{shortened}</h3>
                    </a>
                )}
            </div>
        </div>
    );
}

export default App;
