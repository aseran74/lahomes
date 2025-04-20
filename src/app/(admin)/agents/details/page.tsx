'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AgentDetails from './components/AgentDetails'
import PageTitle from '@/components/PageTitle'

export default function AgentDetailsPage() {
  const searchParams = useSearchParams()
  const [defaultAgentId, setDefaultAgentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFirstAgent = async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setDefaultAgentId(data.id);
        }
      } catch (error) {
        console.error('Error al cargar el primer agente:', error);
      } finally {
        setLoading(false);
      }
    };

    // Si no hay ID en los parámetros, cargar el primer agente
    if (!searchParams.get('id')) {
      loadFirstAgent();
    } else {
      setDefaultAgentId(searchParams.get('id'));
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Detalles del Agente" subName="Agentes" />
      {defaultAgentId && <AgentDetails agentId={defaultAgentId} />}
    </>
  )
} 