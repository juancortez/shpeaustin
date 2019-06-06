import * as React from 'react';
import "./../styles/mixins.less";
import "./../styles/progress_indicator.less";

interface IProgressIndicatorState {
    numElements: number;
    activeElement: number;
    stopAnimation: boolean;
}

export class ProgressIndicator extends React.Component<{}, IProgressIndicatorState> {
    private _intervalMs: number = 1500;

    state = {
        numElements: 4,
        activeElement: 1,
        stopAnimation: false,
    };

    componentDidMount() {
        const queryParamMatch: string[] = window.location.search.match(/indicators=(\d)&noAnimation=(\w+)/) || [];
        const [ _, numIndicators, stopAnimation ] = queryParamMatch;
        if (numIndicators) {
            this.setState({
                numElements: +numIndicators
            });
        }

        if (stopAnimation == 'true') {
            return;
        }

        setInterval(() => {
            const { numElements } = this.state;
            this.setState((prevState) => {
                return {
                    activeElement: ((prevState.activeElement + 1) % numElements)
                }
            });
        }, this._intervalMs);
    }

    public render() {
        return (
            <div className='progress-indicator-container'>
                <ul className='progress-indicator'>
                    { this._buildProgressIndicator() }
                </ul>
            </div>
        )
    }

    private _buildProgressIndicator = () => {
        const { numElements, activeElement } = this.state;

        return [...Array(numElements)].map((e, index) => {
            const elementText: string = `${index + 1} Title`;
            return (
                <React.Fragment key={index}>
                    <li className={activeElement === index ? 'progress-indicator-step active-indicator' : 'progress-indicator-step'}>
                        <div className='indicator-step'>
                            <p aria-label={elementText}>
                                { elementText }
                            </p>
                        </div>
                    </li>
                </React.Fragment>
            );
        });
    }
}