<script lang="ts">
  let { onGenerate } = $props();
  import { type BoxParams } from '../lib/boxGeometry';
  
  let units = $state('in');
  let width = $state('4');
  let depth = $state('5');
  let height = $state('6');
  let materialThickness = $state('0.1875');
  let fileType = $state('pdf');
  let notchLength = $state('0.46875');
  let autoNotch = $state(true);
  let cutWidth = $state('0');
  let boundingBox = $state(false);
  let includeCover: string = $state('1');
  let showAdvanced = $state(false);
  let error = $state('');
  let isGenerating = $state(false);

  $effect(() => {
    if (autoNotch && materialThickness) {
      const thickness = parseFloat(materialThickness);
      if (!isNaN(thickness)) {
        notchLength = (thickness * 2.5).toString();
      }
    }
  });

  function validateNumber(value: string, name: string): string | null {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${name} must be a number!`;
    }
    if (num <= 0) {
      return `${name} must be greater than zero!`;
    }
    return null;
  }

  function convertToMm(value: number): number {
    if (units === 'in') {
      return value * 25.4;
    } else if (units === 'cm') {
      return value * 10.0;
    }
    return value;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    // first validate all the inputs
    error = '';
    
    const errors: string[] = [];
    const widthErr = validateNumber(width, 'Width');
    const heightErr = validateNumber(height, 'Height');
    const depthErr = validateNumber(depth, 'Depth');
    const thicknessErr = validateNumber(materialThickness, 'Material thickness');
    const cutWidthErr = validateNumber(cutWidth, 'Cut width');
    const notchErr = validateNumber(notchLength, 'Notch length');
    
    if (widthErr) errors.push(widthErr);
    if (heightErr) errors.push(heightErr);
    if (depthErr) errors.push(depthErr);
    if (thicknessErr) errors.push(thicknessErr);
    if (cutWidthErr && parseFloat(cutWidth) !== 0) errors.push(cutWidthErr);
    if (notchErr) errors.push(notchErr);

    if (errors.length > 0) {  // validation failed, so terminate here
      error = errors.join(' ');
      return;
    }

    const params: BoxParams = {
      width: convertToMm(parseFloat(width)),
      height: convertToMm(parseFloat(height)),
      depth: convertToMm(parseFloat(depth)),
      thickness: convertToMm(parseFloat(materialThickness)),
      cutWidth: convertToMm(parseFloat(cutWidth) || 0),
      notchLength: convertToMm(parseFloat(notchLength)),
      boundingBox: boundingBox,
      tray: includeCover === '0',
    };

    isGenerating = true;
    error = await onGenerate(params, fileType);
    isGenerating = false;
  }
</script>

<section>
  {#if error}
    <div class="alert alert-danger" role="alert">
        Sorry, we couldn't create your box. {error}
    </div>
  {/if}

  <form onsubmit={handleSubmit}>
  <div class="row mb-3">
      <label for="units" class="col-sm-4 param-label">Units</label>
      <div class="col-sm-8">
      <select bind:value={units} id="units" class="form-select" aria-label="Units">
          <option value="in">inches</option>
          <option value="mm">millimeters</option>
          <option value="cm">centimeters</option>
      </select>
      </div>
  </div>

  <div class="row mb-3">
      <label class="col-sm-4 param-label" for="width">Dimensions</label>
      <div class="col-sm-8">
      <div class="d-flex align-items-center gap-2">
          <input type="text" bind:value={width} class="form-control" style="width: 70px" aria-label="Width" />
          <span>x</span>
          <input type="text" bind:value={depth} class="form-control" style="width: 70px" aria-label="Depth" />
          <span>x</span>
          <input type="text" bind:value={height} class="form-control" style="width: 70px" aria-label="Height" />
      </div>
      <p class="details">The width x depth x height of your box (outer dimension).</p>
      </div>
  </div>

  <div class="row mb-3">
      <label for="thickness" class="col-sm-4 param-label">Material Thickness</label>
      <div class="col-sm-8">
      <div class="d-flex align-items-center gap-2">
          <input type="text" bind:value={materialThickness} id="thickness" class="form-control" style="width: 120px" aria-label="Material Thickness" />
      </div>
      <p class="details">The thickness of the material (needed in order to properly size the notches).</p>
      </div>
  </div>

  <div class="row">
      <label for="fileType" class="col-sm-4 param-label">File Type</label>
      <div class="col-sm-8">
      <select bind:value={fileType} id="fileType" class="form-select" aria-label="File Type">
          <option value="pdf">pdf</option>
          <option value="dxf">dxf</option>
      </select>
      </div>
  </div>

  <div class="row">
      <div class="col-sm-8 offset-sm-4">
      <button type="button" class="btn btn-outline-secondary" onclick={() => showAdvanced = !showAdvanced}>
        <span>advanced options</span>
      </button>
      </div>
  </div>

  {#if showAdvanced}
      <div class="advanced-options">
        <div class="row mb-3">
            <label for="notchLength" class="col-sm-4 param-label">Notch Length</label>
            <div class="col-sm-8">
            <div class="d-flex align-items-center gap-2">
                <input type="text" bind:value={notchLength} disabled={autoNotch} id="notchLength" class="form-control" style="width: 120px" aria-label="Notch Length" />
                <div class="form-check">
                <input type="checkbox" bind:checked={autoNotch} class="form-check-input" id="autoNotch" />
                <label class="form-check-label" for="autoNotch">Auto</label>
                </div>
            </div>
            <p class="details">The length of each notch. If you don't care, just leave the auto checkbox as is. A good general rule is two or three times the material depth.</p>
            </div>
        </div>

        <div class="row mb-3">
            <label for="cutWidth" class="col-sm-4 param-label">Cut Width</label>
            <div class="col-sm-8">
            <div class="d-flex align-items-center gap-2">
                <input type="text" bind:value={cutWidth} id="cutWidth" class="form-control" style="width: 120px" aria-label="Cut Width" />
            </div>
            <p class="details">The width of material removed by the laser. A value of zero is usually safe but loose-fitting.</p>
            </div>
        </div>

        <div class="row mb-3">
            <label class="col-sm-4 param-label" for="boundingBox">Bounding Box</label>
            <div class="col-sm-8">
            <div class="d-flex align-items-center gap-2">
                <div class="form-check">
                <input type="checkbox" bind:checked={boundingBox} class="form-check-input" id="boundingBox" />
                <label class="form-check-label" for="boundingBox">Draw bounding box</label>
                </div>
            </div>
            <p class="details">Having problems with DXF imports? Choose to add a bounding box around the whole box design.</p>
            </div>
        </div>

        <div class="row mb-3">
            <label for="includeCover" class="col-sm-4 param-label">Include Cover</label>
            <div class="col-sm-8">
            <select bind:value={includeCover} id="includeCover" class="form-select" aria-label="Include Cover">
                <option value="1">Yes, include a notched box cover</option>
                <option value="0">No, don't include a cover piece (sides will be flat on top)</option>
            </select>
            </div>
        </div>
      </div>
    {/if}

    <div class="row mt-4">
      <div class="col-sm-8">
        <button type="submit" class="btn btn-lg" disabled={isGenerating}>
            {#if isGenerating}
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            generating...
            {:else}
            download
            {/if}
        </button>
        </div>
    </div>
    </form>
</section>

<style>
label.param-label {
  text-transform: uppercase;
  font-weight: 800;
  font-size: 1rem;
  color: var(--color-black);
  margin-top: var(--margin-small);
}

input[type='text'] {
  color: var(--color-black);
}

select {
  margin-bottom: var(--margin-medium);
}

.details {
  display: block;
  margin-top: var(--margin-small);
  margin-left: var(--margin-small);
  font-size: 0.875rem;
  color: var(--color-faded);
  line-height: 1rem;
}

.advanced-options {
  padding-top: var(--margin-medium);
}

button[type='submit'] {
  background-color: var(--color-salmon);
  font-weight: 600;
  color: var(--color-black);

  &:hover {
    transform: translateY(-1px) translateX(-1px);
    box-shadow: 0 2px 2px rgba(100, 100, 100, 0.5);
  }
  &:active {
    transform: translateY(0px) translateX(0px);
    box-shadow: none;
  }
}

.details {
    display: block;
    margin-top: var(--margin-small);
    margin-left: var(--margin-small);
    font-size: 0.875rem;
    color: var(--color-black);
    opacity: 0.75;
    line-height: 1rem;
}

@media (max-width: 576px) {
  label.param-label {
    padding-bottom: var(--margin-small);
  }
  .details {
    margin-left: 0;
  }
}

</style>