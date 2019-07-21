import * as React from 'react';
import {
    StyleSheet
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
    PanGestureHandler,
    State
} from 'react-native-gesture-handler';
import {
    onGestureEvent,
    preserveOffset,
    runSpring,
    snapPoint
} from 'react-native-redash';

const {
    Value,
    diff,
    modulo,
    divide,
    useCode,
    block,
    sub,
    set,
    Clock,
    cond,
    eq,
    stopClock,
    not,
    clockRunning,
    ceil,
    floor
} = Animated;
const springConfig = {
    toValue: new Value(0),
    damping: 15,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restSpeedThreshold: 0.01,
    restDisplacementThreshold: 0.01
}
interface PanGestureProps {
    index: Animated.Value < number > ;
    ratio: number;
    length: number;
}

export default ({
    index,
    ratio,
    length
}: PanGestureProps) => {
    const clock = new Clock();
    const shouldSnap = new Value(0);
    const state = new Value(State.UNDETERMINED);
    const translationX = new Value(0);
    const velocityX = new Value(0);
    const gestureHandler = onGestureEvent({
        state,
        translationX,
        velocityX
    })
    const translateX = preserveOffset(translationX, state);
    const increment = divide(diff(translateX), ratio);
    const setIndex = (value: Animated.Node < number > ) => set(index, modulo(value, length));
    useCode(block([
        setIndex(sub(index, increment)),
        cond(eq(state, State.BEGAN), stopClock(clock)),
        cond(eq(state, State.END), [
            set(state, State.UNDETERMINED),
            set(shouldSnap, 1)
        ]),
        cond(eq(shouldSnap, 1), [
            setIndex(
                runSpring(
                    clock,
                    index,
                    snapPoint(index, divide(velocityX, -ratio), [
                        ceil(index), floor(index)
                    ]),
                    springConfig
                )
            )
        ]),
        cond(not(clockRunning(clock)), set(shouldSnap, 0))
    ]), [])
    return (
        <PanGestureHandler {
            ...gestureHandler
        }>
            <Animated.View style = {
                StyleSheet.absoluteFill
            }/>
        </PanGestureHandler>
    );
}