<script lang="ts">
  import Intro from './components/Intro.svelte';
  import Form from './components/Form.svelte';
  import Footer from './components/Footer.svelte';
  import { generateBox, type BoxParams } from './lib/boxGeometry';
  import { generatePDF, downloadPDF } from './lib/pdfExporter';
  import { generateDXF, downloadDXF } from './lib/dxfExporter';

  async function handleGenerate(boxParams: BoxParams, fileType: 'pdf' | 'dxf') : Promise<string | null> {
    try {
      const result = generateBox(boxParams);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `box-${timestamp}`;

      if (fileType === 'pdf') {
        const pdfData = await generatePDF(result, APP_NAME, APP_VERSION, HOMEPAGE);
        downloadPDF(pdfData, `${filename}.pdf`);
      } else if (fileType === 'dxf') {
        const dxfData = generateDXF(result);
        downloadDXF(dxfData, `${filename}.dxf`);
      }
    } catch (err) {
      return `Error generating box: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      return '';  // indication of no error
    }
  }
</script>

<main>

  <Intro />
    
  <div class="container">
    <div class="row">
      <div class="col-lg-8">
        <Form onGenerate={handleGenerate} />
      </div>
    </div>
  </div>

  <Footer />

</main>
