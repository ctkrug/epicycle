export const DEFAULT_LOOP_SECONDS = 6;

export function advanceAnimation(state, dtSeconds) {
  if (!state.playing) {
    return { ...state, looped: false };
  }

  const increment = (dtSeconds * state.speed) / state.loopSeconds;
  let t = state.t + increment;
  let looped = false;
  if (t >= 1) {
    t %= 1;
    looped = true;
  }

  return { ...state, t, looped };
}
