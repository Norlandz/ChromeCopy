There is no single "ISO standard" specifically named for "round shoulders." Instead, the measurement is formalized through a combination of **anthropometric standards** (for dimensions), **biomechanical recommendations** (for landmarks), and **ergonomic assessment protocols** (for posture).

In industrial and clinical settings, "round shoulders" (scientifically termed *scapular protraction* or *forward shoulder posture*) is measured using the following standardized frameworks:

### 1. The ISB Recommendation (Biomechanical Foundation)
The **International Society of Biomechanics (ISB)** provides the most authoritative protocol for defining the shoulder’s position. 
*   **Standard:** ISB recommendation on definitions of joint coordinate systems (Part II: Shoulder).
*   **Metric:** It standardizes the **Bony Landmarks** used for all shoulder measurements:
    *   **C7:** 7th cervical vertebra.
    *   **T8:** 8th thoracic vertebra.
    *   **AA:** Angulus Acromialis (the lateral point of the acromion).
    *   **IJ:** Incisura Jugularis (top of the sternum).
*   **Use Case:** Any industrial tool (like 3D body scanners or motion capture) used to measure shoulder curvature must align with these ISB landmarks to be considered scientifically valid.

### 2. ISO 7250-1 (Anthropometric Standards)
This is the "industrial dictionary" for human body measurement used in design (e.g., car seats, workstations).
*   **ISO 7250-1:** *Basic human body measurements for technological design.*
*   **Standard Metric:** It defines **Biacromial Breadth** (distance between the two acromia) and **Shoulder Height**. 
*   **How it measures "Roundness":** While ISO 7250 focuses on a "relaxed erect" posture, "round shoulders" are typically quantified as a deviation from these baseline ISO dimensions—specifically by comparing the **Biacromial Breadth** to the **Chest Depth** or using a 3D scan to calculate the sagittal distance from the spine to the acromion.

### 3. ISO 11226 (Ergonomic Posture Evaluation)
If you are measuring round shoulders to determine if a workspace is safe, this is the industrial standard.
*   **ISO 11226:** *Ergonomics — Evaluation of static working postures.*
*   **Metric:** It measures **Shoulder Flexion/Extension** and **Scapular Protraction** angles. It provides "Acceptability Zones" (Green/Yellow/Red) for how far forward a shoulder can be held before it is considered a musculoskeletal risk.

### 4. Common Industrial/Clinical Metrics
In practice, industries (especially garment manufacturing and ergonomics) use these specific indices derived from the standards above:

| Metric | Formula / Method | Formal Source |
| :--- | :--- | :--- |
| **Shoulder Protraction Index (SPI)** | $\frac{\text{Distance (C7 to Acromion)}}{\text{Biacromial Breadth}} \times 100$ | Clinical Standard (Nijs et al.) |
| **Rounded Shoulder Posture (RSP) Angle** | The angle formed between a vertical line through **C7** and a line connecting **C7 to the Acromion**. | Ergonomic Research |
| **The Scapular Index** | $\frac{\text{Distance (Medial Border to Spine)}}{\text{Biacromial Breadth}} \times 100$ | Biomechanical Research |

### Summary for Implementation
If you are looking for a formal metric to use in a technical specification or research paper:
*   **For 3D data/software:** Use **ISB joint coordinate systems**.
*   **For workstation/product design:** Use **ISO 7250-1** landmarks.
*   **For health and safety assessment:** Use **ISO 11226** angular limits.
*   **Most common quantitative unit:** The **Shoulder Protraction Index (SPI)**, which provides a percentage score of "roundedness" regardless of the person's size.