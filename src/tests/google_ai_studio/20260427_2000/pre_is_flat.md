Here is a concise demo of the Vision Transformer (ViT) architecture.

### 1. Mathematical Representation (Self-Attention)
The core of ViT is the Scaled Dot-Product Attention, which processes flattened image patches:

*   **Attention Formula:**
    $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
*   **Input Projection:** The image is divided into $N$ patches of size $P \times P$, flattened into vectors $x_p \in \mathbb{R}^{P^2 \cdot C}$, and projected:
    $$z_0 = [x_{class}; x_p^1E; x_p^2E; \dots; x_p^NE] + E_{pos}$$
    *(where $E$ is the patch embedding and $E_{pos}$ is the positional encoding).*

---

### 2. Implementation Snippet (PyTorch)
A minimal representation of the Patch Embedding and Transformer block:

```python
import torch.nn as nn

class PatchEmbedding(nn.Module):
    def __init__(self, img_size=224, patch_size=16, in_chans=3, embed_dim=768):
        super().__init__()
        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        # x: [B, C, H, W] -> [B, embed_dim, N_patches] -> [B, N_patches, embed_dim]
        return self.proj(x).flatten(2).transpose(1, 2)

# ViT Block (simplified)
vit_block = nn.TransformerEncoderLayer(d_model=768, nhead=12, batch_first=True)
```

---

### 3. Key Components Breakdown
*   **Patch Partitioning:** Images are treated as sequences of patches (similar to words in NLP).
*   **Learnable Embeddings:** A `[CLS]` token is prepended to the sequence to represent the global image classification.
*   **Positional Encodings:** Since transformers are permutation-invariant, learned vectors are added to retain spatial information.
*   **MLP Head:** A standard Feed-Forward network applied to the `[CLS]` token output for final classification.