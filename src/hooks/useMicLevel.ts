import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

/**
 * Lê o nível de som do microfone em tempo real e devolve um valor aproximado em "dB"
 * (escala relativa 0–120 para exibição). O processamento é só de volume — nenhuma
 * gravação é salva. Use `active` para ligar/desligar o monitoramento.
 */
export function useMicLevel(active: boolean) {
  const [nivel, setNivel] = useState(0);
  const [permitido, setPermitido] = useState<boolean | null>(null);
  const recRef = useRef<Audio.Recording | null>(null);
  const suaveRef = useRef(0);

  useEffect(() => {
    let montado = true;

    async function iniciar() {
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (!montado) return;
        setPermitido(perm.granted);
        if (!perm.granted) return;

        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync({
          ...Audio.RecordingOptionsPresets.LOW_QUALITY,
          isMeteringEnabled: true,
        });
        rec.setProgressUpdateInterval(90);
        rec.setOnRecordingStatusUpdate((st) => {
          if (montado && st.isRecording && typeof st.metering === 'number') {
            // metering vem em dBFS (negativo). Mapeia para uma escala de exibição.
            const bruto = Math.min(120, Math.max(0, st.metering + 100));
            // média móvel exponencial para uma transição suave
            suaveRef.current = suaveRef.current * 0.82 + bruto * 0.18;
            setNivel(Math.round(suaveRef.current));
          }
        });
        await rec.startAsync();
        recRef.current = rec;
      } catch (_) {}
    }

    function parar() {
      const rec = recRef.current;
      recRef.current = null;
      suaveRef.current = 0;
      if (rec) rec.stopAndUnloadAsync().catch(() => {});
      // devolve a sessão de áudio ao modo de reprodução (senão o player não toca depois)
      Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }).catch(() => {});
      setNivel(0);
    }

    if (active) iniciar();
    else parar();

    return () => { montado = false; parar(); };
  }, [active]);

  return { nivel, permitido };
}
