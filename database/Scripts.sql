-- =========================================================================
-- SUAS TABELAS ATUAIS (MANTIDAS IGUAIS PARA NÃO QUEBRAR O JAVASCRIPT)
-- =========================================================================

CREATE TABLE IF NOT EXISTS administradores (
    matricula INT PRIMARY KEY,
    senha VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    id_C SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS demandas (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL,
    texto_demanda TEXT NOT NULL,
    deseja_identificar BOOLEAN DEFAULT FALSE,
    nome_usuario VARCHAR(150) DEFAULT 'Anônimo',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Pendente',
    funcionario_responsavel INT,

    CONSTRAINT fk_demanda_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id_C),

    CONSTRAINT fk_demandas_funcionario
        FOREIGN KEY (funcionario_responsavel)
        REFERENCES administradores (matricula)
        ON DELETE SET NULL
);

-- =========================================================================
-- PARTE CORRIGIDA (HISTÓRICO, FUNÇÃO E TRIGGER)
-- =========================================================================

DROP TABLE IF EXISTS historico_demandas CASCADE;

CREATE TABLE historico_demandas (
    id SERIAL PRIMARY KEY, 
    demanda_id INT NOT NULL,
    categoria_id INT NOT NULL,
    descricao TEXT,
    identificado BOOLEAN,
    nome_colaborador VARCHAR(100),
    data_registro TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'Pendente',
    funcionario_responsavel INT,
    data_exclusao TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- ALTERAÇÃO AQUI: Removido o 'ON DELETE CASCADE' que apagava o histórico sozinho.
    -- Agora a chave estrangeira apenas documenta o ID original sem interferir na exclusão.
    CONSTRAINT fk_historico_demanda
        FOREIGN KEY (demanda_id)
        REFERENCES demandas (id),

    CONSTRAINT fk_historico_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id_C), 

    CONSTRAINT fk_historico_funcionario
        FOREIGN KEY (funcionario_responsavel)
        REFERENCES administradores (matricula)
        ON DELETE SET NULL
);

-- Desativa o RLS para garantir que o banco salve as alterações através da API/Trigger
ALTER TABLE public.historico_demandas DISABLE ROW LEVEL SECURITY;

-- 1. Cria ou atualiza a função do Trigger
CREATE OR REPLACE FUNCTION public.processar_historico_exclusao()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.historico_demandas (
        demanda_id, 
        categoria_id, 
        descricao, 
        identificado, 
        nome_colaborador, 
        data_registro, 
        status, 
        funcionario_responsavel
    ) 
    VALUES (
        OLD.id, 
        OLD.categoria_id, 
        OLD.texto_demanda,          
        OLD.deseja_identificar,     
        OLD.nome_usuario,          
        OLD.data_criacao,          
        OLD.status, 
        OLD.funcionario_responsavel
    );
    
    RETURN OLD; 
END;
$$ LANGUAGE plpgsql;

-- 2. Recria o Trigger de forma limpa
DROP TRIGGER IF EXISTS tr_fale_facil_deletar_demanda ON public.demandas;

CREATE TRIGGER tr_fale_facil_deletar_demanda
BEFORE DELETE ON public.demandas
FOR EACH ROW
EXECUTE FUNCTION public.processar_historico_exclusao();

-- Remove a restrição de chave estrangeira que está impedindo a exclusão
ALTER TABLE public.historico_demandas 
DROP CONSTRAINT IF EXISTS fk_historico_demanda;
