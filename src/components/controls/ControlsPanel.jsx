import ColorControls from './ColorControls';
import LogoScaleField from './LogoScaleField';
import LogoUploadField from './LogoUploadField';
import TextField from './TextField';
import TextPositionField from './TextPositionField';

const ControlsPanel = ({
  config,
  errors,
  logoUploadState,
  logoUploadStatusLabel,
  onColorChange,
  onLogoUpload,
  onRangeChange,
  onSubmit,
  onTextChange,
}) => (
  <section className="panel panel-controls form-panel" aria-labelledby="controls-title">
    <h2 id="controls-title" className="sr-only">Configuração do QR Code</h2>
    <form className="form-grid" noValidate aria-labelledby="controls-title" onSubmit={onSubmit}>
      <TextField
        fieldName="url"
        label="URL de destino"
        hint="Obrigatória"
        type="url"
        value={config.url}
        onChange={onTextChange}
        placeholder="Ex.: https://exemplo.com"
        error={errors.url}
        required
        wide
      />

      <TextField
        fieldName="companyName"
        label="Nome da empresa"
        hint="Opcional"
        value={config.companyName}
        onChange={onTextChange}
        placeholder="Ex.: Nome da empresa"
        error={errors.companyName}
      />

      <TextField
        fieldName="title"
        label="Título"
        hint="Até 40 caracteres"
        value={config.title}
        onChange={onTextChange}
        placeholder="Ex.: Acesse nosso catálogo"
        error={errors.title}
      />

      <TextField
        as="textarea"
        className="text-input text-area"
        fieldName="description"
        label="Descrição curta"
        hint="Até 50 caracteres"
        value={config.description}
        onChange={onTextChange}
        placeholder="Ex.: Consulte cardápio, contatos e horários."
        error={errors.description}
        rows={3}
        wide
      />

      <LogoScaleField
        error={errors.logoScale}
        logoScale={config.logoScale}
        onChange={onRangeChange}
      />

      <LogoUploadField
        logoUploadState={logoUploadState}
        logoUploadStatusLabel={logoUploadStatusLabel}
        onChange={onLogoUpload}
      />

      <ColorControls
        config={config}
        errors={errors}
        onChange={onColorChange}
      />

      <TextPositionField
        error={errors.textPosition}
        onChange={onTextChange}
        value={config.textPosition}
      />
    </form>
  </section>
);

export default ControlsPanel;
