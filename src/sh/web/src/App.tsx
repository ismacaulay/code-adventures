import React, { useState } from 'react';
import './App.css';

enum Duration {
    Single = 'single',
    Hour = 'hour',
    Day = 'day',
}

function App() {
    const [duration, setDuration] = useState(Duration.Single);
    const [shortened, setShortened] = useState(undefined);

    function onDurationChange(e: any) {
        setDuration(e.target.value);
    }

    function onSubmit(e: any) {
        e.preventDefault();
        console.log(duration);

        if (shortened) {
            setShortened(undefined);
        } else {
            setShortened('https://ismacaul.dev/sh/ABC1234');
        }
    }

    return (
        <div className="container">
            <h2 className="header">sh - a url shortener</h2>
            <div className="form-container">
                <form onSubmit={onSubmit}>
                    <input className="input-lng" type="text" />
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
                    <h2 className="url">{shortened}</h2>
                </a>
            )}
        </div>
    );
}

export default App;
