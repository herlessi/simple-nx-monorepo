'use client';

import type { ChaosConfigDto, ChaosTarget } from '@ci-cd/shared-types';
import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../lib/api';

const TARGETS: { key: ChaosTarget; label: string }[] = [
  { key: 'products', label: '📦 Catálogo' },
  { key: 'inventory', label: '🏬 Estoque' },
  { key: 'payment', label: '💳 Pagamento' },
  { key: 'notification', label: '✉️ Notificação' },
];

export default function ChaosPage() {
  const [config, setConfig] = useState<ChaosConfigDto>();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string }>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getChaos()
      .then(setConfig)
      .catch((err) => setMessage({ kind: 'error', text: errorMessage(err) }));
  }, []);

  async function run(action: () => Promise<ChaosConfigDto>, successText: string) {
    setBusy(true);
    try {
      setConfig(await action());
      setMessage({ kind: 'success', text: successText });
    } catch (err) {
      setMessage({ kind: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  function setRule(target: ChaosTarget, field: 'latencyMs' | 'errorRate', value: number) {
    setConfig((prev) => prev && { ...prev, [target]: { ...prev[target], [field]: value } });
    setMessage(undefined);
  }

  return (
    <>
      <h1>Chaos</h1>
      <p className="muted">
        Injete latência e falhas nos serviços da API para gerar cenários de telemetria. A
        configuração fica em memória e volta ao padrão quando a API reinicia.
      </p>
      {message && <div className={`alert alert-${message.kind}`}>{message.text}</div>}

      {config && (
        <div className="card">
          {TARGETS.map(({ key, label }) => (
            <div key={key} className="chaos-row">
              <strong>{label}</strong>
              <label>
                Latência: {config[key].latencyMs} ms
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={config[key].latencyMs}
                  onChange={(e) => setRule(key, 'latencyMs', Number(e.target.value))}
                />
              </label>
              <label>
                Taxa de erro: {Math.round(config[key].errorRate * 100)}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(config[key].errorRate * 100)}
                  onChange={(e) => setRule(key, 'errorRate', Number(e.target.value) / 100)}
                />
              </label>
            </div>
          ))}
          <div className="row">
            <button
              className="btn"
              disabled={busy}
              onClick={() => run(() => api.updateChaos(config), 'Configuração aplicada.')}
            >
              Aplicar
            </button>
            <button
              className="btn btn-outline"
              disabled={busy}
              onClick={() => run(api.resetChaos, 'Configuração resetada.')}
            >
              Resetar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
