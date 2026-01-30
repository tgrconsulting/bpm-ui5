--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tbl_applications; Type: TABLE; Schema: public; Owner: tgrconsulting
--

CREATE TABLE public.tbl_applications (
    application_id character varying(20) CONSTRAINT tblapplications_applicationid_not_null NOT NULL,
    description character varying(100) CONSTRAINT tblapplications_description_not_null NOT NULL
);


ALTER TABLE public.tbl_applications OWNER TO postgres;

--
-- Name: tbl_groups; Type: TABLE; Schema: public; Owner: tgrconsulting
--

CREATE TABLE public.tbl_groups (
    group_id character varying(20) NOT NULL,
    description character varying(100) NOT NULL
);


ALTER TABLE public.tbl_groups OWNER TO postgres;

--
-- Name: tbl_processes; Type: TABLE; Schema: public; Owner: tgrconsulting
--

CREATE TABLE public.tbl_processes (
    process_id character varying(20) NOT NULL,
    description character varying(100),
    group_id character varying(20)
);


ALTER TABLE public.tbl_processes OWNER TO postgres;

--
-- Name: tbl_processevents; Type: TABLE; Schema: public; Owner: tgrconsulting
--

CREATE TABLE public.tbl_processevents (
    process_id character varying(20) CONSTRAINT tbl_processitems_process_id_not_null NOT NULL,
    sequence integer CONSTRAINT tbl_processitems_item_not_null NOT NULL,
    description character varying(100),
    type integer CONSTRAINT tbl_processitems_type_not_null NOT NULL,
    application_id character varying(20) CONSTRAINT tbl_processitems_application_id_not_null NOT NULL,
    CONSTRAINT tbl_processitems_type_check CHECK ((type = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.tbl_processevents OWNER TO postgres;

--
-- Name: tbl_users; Type: TABLE; Schema: public; Owner: tgrconsulting
--

CREATE TABLE public.tbl_users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    company character varying(150)
);


ALTER TABLE public.tbl_users OWNER TO postgres;

--
-- Name: tbl_users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: tgrconsulting
--

CREATE SEQUENCE public.tbl_users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_users_user_id_seq OWNER TO postgres;

--
-- Name: tbl_users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tgrconsulting
--

ALTER SEQUENCE public.tbl_users_user_id_seq OWNED BY public.tbl_users.user_id;


--
-- Name: tbl_users user_id; Type: DEFAULT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_users ALTER COLUMN user_id SET DEFAULT nextval('public.tbl_users_user_id_seq'::regclass);


--
-- Name: tbl_groups tbl_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_groups
    ADD CONSTRAINT tbl_groups_pkey PRIMARY KEY (group_id);


--
-- Name: tbl_processes tbl_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_processes
    ADD CONSTRAINT tbl_processes_pkey PRIMARY KEY (process_id);


--
-- Name: tbl_processevents tbl_processitems_pkey; Type: CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_processevents
    ADD CONSTRAINT tbl_processitems_pkey PRIMARY KEY (process_id, type, sequence);


--
-- Name: tbl_users tbl_users_email_key; Type: CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT tbl_users_email_key UNIQUE (email);


--
-- Name: tbl_users tbl_users_pkey; Type: CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_users
    ADD CONSTRAINT tbl_users_pkey PRIMARY KEY (user_id);


--
-- Name: tbl_applications tblapplications_pkey; Type: CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_applications
    ADD CONSTRAINT tblapplications_pkey PRIMARY KEY (application_id);


--
-- Name: tbl_processes fk_group; Type: FK CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_processes
    ADD CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES public.tbl_groups(group_id);


--
-- Name: tbl_processevents fk_process; Type: FK CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_processevents
    ADD CONSTRAINT fk_process FOREIGN KEY (process_id) REFERENCES public.tbl_processes(process_id);


--
-- Name: tbl_processevents fk_processitems_application; Type: FK CONSTRAINT; Schema: public; Owner: tgrconsulting
--

ALTER TABLE ONLY public.tbl_processevents
    ADD CONSTRAINT fk_processitems_application FOREIGN KEY (application_id) REFERENCES public.tbl_applications(application_id);


--
-- PostgreSQL database dump complete
--


