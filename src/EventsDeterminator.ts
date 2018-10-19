import 'reflect-metadata';
import { injectable } from "inversify";
import { IoState } from "./IoState";
import { Event } from './Event';
import { IoEvents } from "./IoEvents";
import { PressDeterminator } from './EventDeterminators/PressDeterminator';

@injectable()
export class EventsDeterminator
{
    constructor(private _pressDeterminator: PressDeterminator)
    { }

    private eventsDefs = {
        [Event.OnChange]: (ioState: IoState) => ioState.currentValue !== ioState.previousValue,
        [Event.OnRising]: (ioState: IoState) => ioState.currentValue > ioState.previousValue,
        [Event.OnFalling]: (ioState: IoState) => ioState.currentValue < ioState.previousValue,
        [Event.OnZero]: (ioState: IoState) => ioState.currentValue === 0,
        [Event.OnNonZero]: (ioState: IoState) => ioState.currentValue !== 0,
        [Event.OnPress]: (ioState: IoState) => this._pressDeterminator.IsPress(ioState, 20, 300),
        [Event.OnLongPress]: (ioState: IoState) => this._pressDeterminator.IsPress(ioState, 300, 2000),
    };


    public Determine(ioEvents: IoEvents, ioState: IoState): Event[]
    {
        const toExecute: Event[] = [];
        if (ioEvents === undefined)
            return toExecute;

        const ioEventsNames: Event[] = Object.keys(ioEvents) as Event[];
        ioEventsNames.forEach((ioEventName: Event) =>
        {
            // encapsulate in IsCommandDefined
            const eventCommand = ioEvents[ioEventName];
            if (eventCommand.trim().length === 0)
                return; // IsDefined
            const eventDef = this.eventsDefs[ioEventName];
            const canExecuteCommand = eventDef(ioState);

            if (canExecuteCommand)
            {
                toExecute.push(ioEventName);
            }
        });

        return toExecute;
    }
}
