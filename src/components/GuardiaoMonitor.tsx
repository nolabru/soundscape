import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useMicLevel } from '../hooks/useMicLevel';
import { useAppState } from '../AppState';

/**
 * Monitor global do Guardião. Roda enquanto o usuário está nas abas principais e
 * o Guardião está ativo. Ao detectar ruído acima do limiar, sugere o Refúgio Sonoro.
 * Pausa o microfone sempre que outra tela está usando a sessão de áudio (audioOcupado).
 */
export default function GuardiaoMonitor() {
  const navigation = useNavigation<any>();
  const { audioOcupado } = useAppState();
  const [ativo, setAtivo] = useState(false);
  const [limiar, setLimiar] = useState(75);
  const [refugio, setRefugio] = useState<string | null>(null);
  const [pausaTemp, setPausaTemp] = useState(false);
  const alertRef = useRef(false);

  useEffect(() => { carregar(); }, [audioOcupado]);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAtivo(false); return; }
    const { data } = await supabase.from('profiles').select('guardiao_ativo, guardiao_limiar, som_refugio').eq('id', user.id).single();
    setAtivo(!!data?.guardiao_ativo);
    setLimiar(data?.guardiao_limiar ?? 75);
    setRefugio(data?.som_refugio ?? null);
  }

  const monitorar = ativo && !audioOcupado && !pausaTemp;
  const { nivel } = useMicLevel(monitorar);

  useEffect(() => {
    if (!monitorar || alertRef.current) return;
    if (nivel < limiar) return;

    alertRef.current = true;
    setPausaTemp(true);
    Alert.alert(
      'Ruído alto detectado',
      'O ambiente está acima do seu limiar. Deseja ativar o seu Refúgio Sonoro?',
      [
        { text: 'Agora não', style: 'cancel', onPress: () => liberar() },
        { text: 'Ativar Refúgio', onPress: () => { if (refugio) navigation.navigate('Player', { somId: refugio }); liberar(); } },
      ]
    );
  }, [nivel, monitorar, limiar, refugio]);

  // cooldown de 20s antes de poder alertar de novo
  function liberar() {
    setTimeout(() => { alertRef.current = false; setPausaTemp(false); }, 20000);
  }

  return null;
}
