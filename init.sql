-- Create database
CREATE DATABASE IF NOT EXISTS api_tasks;
USE api_tasks;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    UserID VARCHAR(50) PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL
);

-- Create IdeaCategories table (previously TaskCategories)
CREATE TABLE IF NOT EXISTS IdeaCategories (
    CategoryID VARCHAR(50) PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL
);

-- Create IdeaStatus table (previously TaskStatus)
CREATE TABLE IF NOT EXISTS IdeaStatus (
    StatusID VARCHAR(50) PRIMARY KEY,
    StatusName VARCHAR(100) NOT NULL
);

-- Create Ideas table (previously Tasks)
CREATE TABLE IF NOT EXISTS Ideas (
    IdeaID VARCHAR(50) PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    DueDate DATE,
    UserID VARCHAR(50),
    CategoryID VARCHAR(50),
    StatusID VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CategoryID) REFERENCES IdeaCategories(CategoryID),
    FOREIGN KEY (StatusID) REFERENCES IdeaStatus(StatusID)
);

-- Insert sample Users
INSERT INTO Users (UserID, UserName, Email) VALUES
('1', 'João Silva', 'joao.silva@email.com'),
('2', 'Maria Santos', 'maria.santos@email.com'),
('3', 'Pedro Costa', 'pedro.costa@email.com'),
('4', 'Ana Oliveira', 'ana.oliveira@email.com'),
('5', 'Carlos Ferreira', 'carlos.ferreira@email.com');

-- Insert sample IdeaCategories
INSERT INTO IdeaCategories (CategoryID, CategoryName) VALUES
('1', 'Tecnologia'),
('2', 'Negócios'),
('3', 'Criatividade'),
('4', 'Educação'),
('5', 'Saúde'),
('6', 'Sustentabilidade'),
('7', 'Entretenimento'),
('8', 'Ciência'),
('9', 'Arte'),
('10', 'Inovação');

-- Insert sample IdeaStatus
INSERT INTO IdeaStatus (StatusID, StatusName) VALUES
('1', 'Conceito'),
('2', 'Em Desenvolvimento'),
('3', 'Prototipagem'),
('4', 'Testando'),
('5', 'Implementado'),
('6', 'Pausado'),
('7', 'Cancelado'),
('8', 'Revisão'),
('9', 'Aprovado'),
('10', 'Finalizado');

-- Insert sample Ideas
-- Removed sample ideas to allow deletion of categories and statuses
-- INSERT INTO Ideas (IdeaID, Title, Description, DueDate, UserID, CategoryID, StatusID) VALUES
-- ('1', 'App de Gestão de Ideias', 'Uma aplicação web para gerenciar e organizar ideias criativas', '2024-12-31', '1', '1', '2'),
-- ('2', 'Plataforma de Educação Online', 'Sistema de cursos online interativos', '2024-11-15', '2', '4', '1'),
-- ('3', 'Eco-Friendly Packaging', 'Embalagens sustentáveis para produtos', '2024-10-20', '3', '6', '3'),
-- ('4', 'AI-Powered Health Monitor', 'Monitor de saúde com inteligência artificial', '2024-09-30', '4', '5', '2'),
-- ('5', 'Virtual Reality Museum', 'Museu virtual com experiências imersivas', '2024-08-25', '5', '7', '1'); 