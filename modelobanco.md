-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alertas_config (
  id bigint NOT NULL DEFAULT nextval('alertas_config_id_seq'::regclass),
  usuario_id uuid NOT NULL,
  tipo_alerta character varying NOT NULL,
  ativo boolean DEFAULT true,
  canal character varying DEFAULT 'app'::character varying CHECK (canal::text = ANY (ARRAY['app'::character varying, 'email'::character varying, 'whatsapp'::character varying, 'sms'::character varying]::text[])),
  threshold_valor double precision,
  threshold_unidade character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alertas_config_pkey PRIMARY KEY (id),
  CONSTRAINT alertas_config_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.aplicacoes (
  id bigint NOT NULL DEFAULT nextval('aplicacoes_id_seq'::regclass),
  talhao_id bigint NOT NULL,
  safra_id bigint,
  usuario_id uuid NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['defensivo'::character varying, 'fertilizante'::character varying, 'corretivo'::character varying, 'herbicida'::character varying, 'fungicida'::character varying, 'inseticida'::character varying]::text[])),
  produto character varying NOT NULL,
  fabricante character varying,
  dose double precision NOT NULL,
  unidade_dose character varying DEFAULT 'L/ha'::character varying,
  area_aplicada double precision,
  volume_total double precision,
  data_aplicacao timestamp with time zone NOT NULL,
  responsavel character varying,
  observacoes text,
  comprovante_url text,
  created_at timestamp with time zone DEFAULT now(),
  safra_talhao_id bigint,
  latitude double precision,
  longitude double precision,
  CONSTRAINT aplicacoes_pkey PRIMARY KEY (id),
  CONSTRAINT aplicacoes_talhao_id_fkey FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id),
  CONSTRAINT aplicacoes_safra_id_fkey FOREIGN KEY (safra_id) REFERENCES public.safras(id),
  CONSTRAINT aplicacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id),
  CONSTRAINT aplicacoes_safra_talhao_fk FOREIGN KEY (safra_talhao_id) REFERENCES public.safra_talhao(id)
);
CREATE TABLE public.auth_group (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL UNIQUE,
  CONSTRAINT auth_group_pkey PRIMARY KEY (id)
);
CREATE TABLE public.auth_group_permissions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  group_id integer NOT NULL,
  permission_id integer NOT NULL,
  CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id),
  CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id)
);
CREATE TABLE public.auth_permission (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  content_type_id integer NOT NULL,
  codename character varying NOT NULL,
  CONSTRAINT auth_permission_pkey PRIMARY KEY (id),
  CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id)
);
CREATE TABLE public.configuracoes (
  id bigint NOT NULL DEFAULT nextval('configuracoes_id_seq'::regclass),
  usuario_id uuid NOT NULL UNIQUE,
  idioma character varying DEFAULT 'pt-BR'::character varying,
  fuso_horario character varying DEFAULT 'America/Sao_Paulo'::character varying,
  unidade_area character varying DEFAULT 'hectare'::character varying,
  unidade_temperatura character varying DEFAULT 'celsius'::character varying,
  formato_data character varying DEFAULT 'DD/MM/YYYY'::character varying,
  tema character varying DEFAULT 'system'::character varying,
  notificacoes_email boolean DEFAULT true,
  notificacoes_push boolean DEFAULT true,
  notificacoes_whatsapp boolean DEFAULT false,
  limite_temp_alta double precision DEFAULT 35,
  limite_temp_baixa double precision DEFAULT 10,
  limite_umidade_baixa double precision DEFAULT 30,
  limite_precipitacao_alta double precision DEFAULT 50,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  notificacoes_sms boolean DEFAULT false,
  horario_inicio_notif time without time zone DEFAULT '06:00:00'::time without time zone,
  horario_fim_notif time without time zone DEFAULT '22:00:00'::time without time zone,
  dashboard_widgets jsonb DEFAULT '["clima", "pragas", "irrigacao", "produtividade"]'::jsonb,
  fazenda_padrao_id bigint,
  unidade_velocidade character varying DEFAULT 'km/h'::character varying,
  unidade_precipitacao character varying DEFAULT 'mm'::character varying,
  alerta_umidade_alta double precision DEFAULT 90,
  alerta_vento_forte double precision DEFAULT 60,
  alerta_geada boolean DEFAULT true,
  CONSTRAINT configuracoes_pkey PRIMARY KEY (id),
  CONSTRAINT configuracoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.dados_climaticos (
  id bigint NOT NULL DEFAULT nextval('dados_climaticos_id_seq'::regclass),
  fazenda_id bigint NOT NULL,
  talhao_id bigint,
  temperatura double precision NOT NULL,
  umidade double precision NOT NULL,
  precipitacao double precision DEFAULT 0,
  velocidade_vento double precision,
  direcao_vento character varying,
  pressao_atmosferica double precision,
  radiacao_solar double precision,
  fonte character varying DEFAULT 'manual'::character varying CHECK (fonte::text = ANY (ARRAY['manual'::character varying, 'api'::character varying, 'sensor'::character varying, 'estacao'::character varying]::text[])),
  data_coleta timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  temperatura_min double precision,
  temperatura_max double precision,
  e_previsao boolean DEFAULT false,
  indice_uv double precision,
  nebulosidade integer,
  CONSTRAINT dados_climaticos_pkey PRIMARY KEY (id),
  CONSTRAINT dados_climaticos_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id),
  CONSTRAINT dados_climaticos_talhao_id_fkey FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id)
);
CREATE TABLE public.dashboard_dadosprodutividade (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cultura character varying NOT NULL,
  area double precision NOT NULL,
  produtividade double precision NOT NULL,
  data timestamp with time zone NOT NULL,
  fazenda_id bigint NOT NULL,
  CONSTRAINT dashboard_dadosprodutividade_pkey PRIMARY KEY (id),
  CONSTRAINT dashboard_dadosprodu_fazenda_id_43a568c6_fk_fazenda_f FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
);
CREATE TABLE public.django_admin_log (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  action_time timestamp with time zone NOT NULL,
  object_id text,
  object_repr character varying NOT NULL,
  action_flag smallint NOT NULL CHECK (action_flag >= 0),
  change_message text NOT NULL,
  content_type_id integer,
  user_id bigint NOT NULL,
  CONSTRAINT django_admin_log_pkey PRIMARY KEY (id),
  CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id),
  CONSTRAINT django_admin_log_user_id_c564eba6_fk_custom_auth_customuser_id FOREIGN KEY (user_id) REFERENCES extensions.custom_auth_customuser(id)
);
CREATE TABLE public.django_content_type (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  app_label character varying NOT NULL,
  model character varying NOT NULL,
  CONSTRAINT django_content_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.django_migrations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  app character varying NOT NULL,
  name character varying NOT NULL,
  applied timestamp with time zone NOT NULL,
  CONSTRAINT django_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.django_session (
  session_key character varying NOT NULL,
  session_data text NOT NULL,
  expire_date timestamp with time zone NOT NULL,
  CONSTRAINT django_session_pkey PRIMARY KEY (session_key)
);
CREATE TABLE public.fazenda_fazenda (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  localizacao character varying,
  usuario_id bigint NOT NULL,
  CONSTRAINT fazenda_fazenda_pkey PRIMARY KEY (id),
  CONSTRAINT fazenda_fazenda_usuario_id_1774f938_fk_custom_au FOREIGN KEY (usuario_id) REFERENCES extensions.custom_auth_customuser(id)
);
CREATE TABLE public.fazendas (
  id bigint NOT NULL DEFAULT nextval('fazendas_id_seq'::regclass),
  nome character varying NOT NULL,
  localizacao character varying,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  area_total double precision,
  usuario_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tipo_propriedade character varying,
  cidade character varying,
  estado character varying,
  ativo boolean DEFAULT true,
  CONSTRAINT fazendas_pkey PRIMARY KEY (id),
  CONSTRAINT fazendas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.irrigacao_dadosclimaticos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  temperatura double precision NOT NULL,
  umidade double precision NOT NULL,
  precipitacao double precision NOT NULL,
  data_coleta timestamp with time zone NOT NULL,
  fazenda_id bigint NOT NULL,
  CONSTRAINT irrigacao_dadosclimaticos_pkey PRIMARY KEY (id),
  CONSTRAINT irrigacao_dadosclima_fazenda_id_d677cb4d_fk_fazenda_f FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
);
CREATE TABLE public.irrigacao_historico (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  irrigacao_id bigint NOT NULL,
  status character varying NOT NULL,
  volume_agua double precision,
  duracao_minutos integer,
  data_evento timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT irrigacao_historico_pkey PRIMARY KEY (id),
  CONSTRAINT irrigacao_historico_irrigacao_id_fkey FOREIGN KEY (irrigacao_id) REFERENCES public.irrigacao_irrigacao(id)
);
CREATE TABLE public.irrigacao_irrigacao (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  status character varying NOT NULL,
  fazenda_id bigint NOT NULL,
  CONSTRAINT irrigacao_irrigacao_pkey PRIMARY KEY (id),
  CONSTRAINT irrigacao_irrigacao_fazenda_id_42d1caed_fk_fazenda_fazenda_id FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
);
CREATE TABLE public.irrigacoes (
  id bigint NOT NULL DEFAULT nextval('irrigacoes_id_seq'::regclass),
  sistema_id bigint,
  fazenda_id bigint NOT NULL,
  talhao_id bigint,
  quantidade_agua double precision NOT NULL,
  duracao integer NOT NULL,
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone,
  status character varying DEFAULT 'agendada'::character varying CHECK (status::text = ANY (ARRAY['agendada'::character varying, 'em_andamento'::character varying, 'concluida'::character varying, 'cancelada'::character varying]::text[])),
  origem character varying DEFAULT 'manual'::character varying CHECK (origem::text = ANY (ARRAY['manual'::character varying, 'automatica'::character varying, 'recomendacao'::character varying]::text[])),
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT irrigacoes_pkey PRIMARY KEY (id),
  CONSTRAINT irrigacoes_sistema_id_fkey FOREIGN KEY (sistema_id) REFERENCES public.sistemas_irrigacao(id),
  CONSTRAINT irrigacoes_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id),
  CONSTRAINT irrigacoes_talhao_id_fkey FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id)
);
CREATE TABLE public.logs_atividade (
  id bigint NOT NULL DEFAULT nextval('logs_atividade_id_seq'::regclass),
  usuario_id uuid,
  acao character varying NOT NULL,
  tabela character varying,
  registro_id bigint,
  dados_anteriores jsonb,
  dados_novos jsonb,
  ip_address character varying,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT logs_atividade_pkey PRIMARY KEY (id),
  CONSTRAINT logs_atividade_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.mapas (
  id bigint NOT NULL DEFAULT nextval('mapas_id_seq'::regclass),
  fazenda_id bigint NOT NULL,
  nome character varying NOT NULL,
  descricao text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  zoom integer DEFAULT 12,
  camadas_ativas jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  publico boolean DEFAULT false,
  tipo_mapa character varying DEFAULT 'satellite'::character varying,
  filtros jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT mapas_pkey PRIMARY KEY (id),
  CONSTRAINT mapas_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id)
);
CREATE TABLE public.maps_mapa (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  zoom integer NOT NULL,
  data_criacao timestamp with time zone NOT NULL,
  fazenda_id bigint NOT NULL,
  CONSTRAINT maps_mapa_pkey PRIMARY KEY (id),
  CONSTRAINT maps_mapa_fazenda_id_9a5bc165_fk_fazenda_fazenda_id FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
);
CREATE TABLE public.notificacoes (
  id bigint NOT NULL DEFAULT nextval('notificacoes_id_seq'::regclass),
  usuario_id uuid NOT NULL,
  titulo character varying NOT NULL,
  mensagem text NOT NULL,
  tipo character varying DEFAULT 'info'::character varying CHECK (tipo::text = ANY (ARRAY['info'::character varying, 'alerta'::character varying, 'critico'::character varying, 'sucesso'::character varying]::text[])),
  categoria character varying CHECK (categoria::text = ANY (ARRAY['clima'::character varying, 'praga'::character varying, 'irrigacao'::character varying, 'produtividade'::character varying, 'sistema'::character varying]::text[])),
  lida boolean DEFAULT false,
  data_leitura timestamp with time zone,
  link character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notificacoes_pkey PRIMARY KEY (id),
  CONSTRAINT notificacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.pragas (
  id bigint NOT NULL DEFAULT nextval('pragas_id_seq'::regclass),
  fazenda_id bigint NOT NULL,
  talhao_id bigint,
  usuario_id uuid NOT NULL,
  nome character varying NOT NULL,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['praga'::character varying, 'doenca'::character varying, 'infestacao'::character varying, 'deficiencia'::character varying]::text[])),
  nivel_severidade character varying DEFAULT 'baixo'::character varying CHECK (nivel_severidade::text = ANY (ARRAY['baixo'::character varying, 'medio'::character varying, 'alto'::character varying, 'critico'::character varying]::text[])),
  descricao text,
  latitude double precision,
  longitude double precision,
  imagem_url text,
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pendente'::character varying, 'em_tratamento'::character varying, 'resolvido'::character varying, 'monitorando'::character varying]::text[])),
  data_deteccao timestamp with time zone DEFAULT now(),
  data_resolucao timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  safra_talhao_id bigint,
  nome_cientifico character varying,
  categoria character varying,
  porcentagem_area_afetada double precision,
  sintomas text,
  recomendacao_tratamento text,
  produto_recomendado character varying,
  CONSTRAINT pragas_pkey PRIMARY KEY (id),
  CONSTRAINT pragas_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id),
  CONSTRAINT pragas_talhao_id_fkey FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id),
  CONSTRAINT pragas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id),
  CONSTRAINT pragas_safra_talhao_fk FOREIGN KEY (safra_talhao_id) REFERENCES public.safra_talhao(id)
);
CREATE TABLE public.pragas_registro (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  nivel character varying NOT NULL,
  descricao text,
  data_registro timestamp with time zone NOT NULL DEFAULT now(),
  fazenda_id bigint NOT NULL,
  CONSTRAINT pragas_registro_pkey PRIMARY KEY (id),
  CONSTRAINT pragas_registro_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
);
CREATE TABLE public.produtividade (
  id bigint NOT NULL DEFAULT nextval('produtividade_id_seq'::regclass),
  safra_id bigint NOT NULL,
  talhao_id bigint NOT NULL,
  fazenda_id bigint NOT NULL,
  cultura character varying NOT NULL,
  area_colhida double precision NOT NULL,
  producao_total double precision NOT NULL,
  produtividade double precision NOT NULL,
  data_colheita date NOT NULL,
  qualidade character varying,
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  safra_talhao_id bigint,
  CONSTRAINT produtividade_pkey PRIMARY KEY (id),
  CONSTRAINT produtividade_safra_id_fkey FOREIGN KEY (safra_id) REFERENCES public.safras(id),
  CONSTRAINT produtividade_talhao_id_fkey FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id),
  CONSTRAINT produtividade_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id),
  CONSTRAINT produtividade_safra_talhao_fk FOREIGN KEY (safra_talhao_id) REFERENCES public.safra_talhao(id)
);
CREATE TABLE public.produtividade_dadosprodutividade (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cultura character varying NOT NULL,
  area double precision NOT NULL,
  produtividade double precision NOT NULL,
  data timestamp with time zone NOT NULL,
  fazenda_id bigint NOT NULL,
  CONSTRAINT produtividade_dadosprodutividade_pkey PRIMARY KEY (id),
  CONSTRAINT produtividade_dadosp_fazenda_id_2be57304_fk_fazenda_f FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nome character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  telefone character varying,
  role character varying DEFAULT 'produtor'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'produtor'::character varying, 'tecnico'::character varying, 'gestor'::character varying, 'auditor'::character varying]::text[])),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.safra_talhao (
  id bigint NOT NULL DEFAULT nextval('safra_talhao_id_seq'::regclass),
  safra_id bigint NOT NULL,
  talhao_id bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  cultura character varying,
  variedade character varying,
  data_plantio date,
  data_colheita_prevista date,
  data_colheita_real date,
  status character varying DEFAULT 'planejada'::character varying,
  produtividade_estimada double precision,
  produtividade_real double precision,
  CONSTRAINT safra_talhao_pkey PRIMARY KEY (id),
  CONSTRAINT fk_safra FOREIGN KEY (safra_id) REFERENCES public.safras(id),
  CONSTRAINT fk_talhao FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id)
);
CREATE TABLE public.safras (
  id bigint NOT NULL DEFAULT nextval('safras_id_seq'::regclass),
  talhao_id bigint NOT NULL,
  cultura character varying NOT NULL,
  variedade character varying,
  data_plantio date NOT NULL,
  data_colheita_prevista date,
  data_colheita_real date,
  produtividade_esperada double precision,
  produtividade_real double precision,
  status character varying DEFAULT 'planejada'::character varying CHECK (status::text = ANY (ARRAY['planejada'::character varying, 'plantada'::character varying, 'em_desenvolvimento'::character varying, 'colhida'::character varying, 'cancelada'::character varying]::text[])),
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ativa boolean DEFAULT false,
  ano_safra character varying,
  area_plantada double precision,
  custo_total numeric,
  receita_total numeric,
  CONSTRAINT safras_pkey PRIMARY KEY (id),
  CONSTRAINT safras_talhao_id_fkey FOREIGN KEY (talhao_id) REFERENCES public.talhoes(id)
);
CREATE TABLE public.sistemas_irrigacao (
  id bigint NOT NULL DEFAULT nextval('sistemas_irrigacao_id_seq'::regclass),
  fazenda_id bigint NOT NULL,
  nome character varying NOT NULL,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['gotejamento'::character varying, 'aspersao'::character varying, 'pivô'::character varying, 'sulco'::character varying, 'microaspersao'::character varying]::text[])),
  vazao_hora double precision,
  area_cobertura double precision,
  status character varying DEFAULT 'ativo'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sistemas_irrigacao_pkey PRIMARY KEY (id),
  CONSTRAINT sistemas_irrigacao_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id)
);
CREATE TABLE public.talhoes (
  id bigint NOT NULL DEFAULT nextval('talhoes_id_seq'::regclass),
  fazenda_id bigint NOT NULL,
  nome character varying NOT NULL,
  area double precision NOT NULL,
  tipo_solo character varying,
  geometria jsonb,
  cultura_atual character varying,
  responsavel_id uuid,
  status character varying DEFAULT 'ativo'::character varying CHECK (status::text = ANY (ARRAY['ativo'::character varying, 'inativo'::character varying, 'em_preparacao'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  codigo character varying,
  textura_solo character varying,
  topografia character varying,
  observacoes text,
  CONSTRAINT talhoes_pkey PRIMARY KEY (id),
  CONSTRAINT talhoes_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id),
  CONSTRAINT talhoes_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.token_blacklist_blacklistedtoken (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  blacklisted_at timestamp with time zone NOT NULL,
  token_id bigint NOT NULL UNIQUE,
  CONSTRAINT token_blacklist_blacklistedtoken_pkey PRIMARY KEY (id),
  CONSTRAINT token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk FOREIGN KEY (token_id) REFERENCES public.token_blacklist_outstandingtoken(id)
);
CREATE TABLE public.token_blacklist_outstandingtoken (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  token text NOT NULL,
  created_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  user_id bigint,
  jti character varying NOT NULL UNIQUE,
  CONSTRAINT token_blacklist_outstandingtoken_pkey PRIMARY KEY (id),
  CONSTRAINT token_blacklist_outs_user_id_83bc629a_fk_custom_au FOREIGN KEY (user_id) REFERENCES extensions.custom_auth_customuser(id)
);
CREATE TABLE public.usuarios_fazenda (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  localizacao character varying NOT NULL,
  usuario_id bigint NOT NULL,
  CONSTRAINT usuarios_fazenda_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_fazenda_usuario_id_29f91da7_fk_custom_au FOREIGN KEY (usuario_id) REFERENCES extensions.custom_auth_customuser(id)
);