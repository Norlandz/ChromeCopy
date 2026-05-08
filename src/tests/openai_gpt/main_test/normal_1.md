You are pointing at a real gap.

The shallow explanation says:

> The RNN hidden state “summarizes the previous tokens,” then the model “uses context,” then backprop “learns the right representation.”

That is not a mechanistic explanation. It is mostly a behavioral description.

The stricter version is:

h_t = \phi(W_x x_t + W_h h_{t-1} + b)

This equation does **not** say the hidden state “understands,” “summarizes,” or “contains meaning.” It only says:

> the hidden state is a recursively updated vector whose values are chosen so that the final input-output behavior reduces loss.

That is much weaker.

A better way to say it:

> The hidden state is not intrinsically a “context vector.” It is a learned internal state of a dynamical system. Its only formal meaning is its causal role in producing future outputs.

The missing thing is usually this:

> There is no guaranteed semantic mapping from human concepts to hidden-state coordinates.

People often talk as if:

```
hidden state = compressed meaning of the past
```
