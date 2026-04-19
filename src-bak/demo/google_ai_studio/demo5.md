### 3. The Math of Flattening (The Vectorization)

Each patch is a 3D volume: $16 \text{ (height)} \times 16 \text{ (width)} \times 3 \text{ (channels)}$. To feed this into the Transformer, it must be a 1D vector.

**The Strict Transformation:**
1.  **Extract Patch:** $x^{(i,j)} \in \mathbb{R}^{16 \times 16 \times 3}$ where $i,j$ are the grid coordinates $(0..13, 0..13)$.
2.  **Flatten:** 
    $$16 \times 16 \times 3 = 768$$
    The vector $x_p^{(k)}$ is created by unrolling the pixels.
    $$x_p^{(k)} = [p_1, p_2, p_3, \dots, p_{768}]^T \in \mathbb{R}^{768}$$

**The Tensor Operation (Rearrange):**
In a production environment (using EinOps or Torch logic), this is a single "fold/unfold" operation:
