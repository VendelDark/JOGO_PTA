// Importando os módulos necessários
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Interface para o objeto de usuário
interface User {
    username: string;
    role: string;
}

// Estendendo a interface Request para incluir a propriedade user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

// Inicializando o servidor Express
const app = express();
const PORT = 3000;

// Middleware para autenticação por meio de tokens
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Recebe o token do cabeçalho Authorization
    const token = req.cookies.token;

    // Se não houver token, retorna um erro de não autorizado
    if (!token) return res.status(401).send('Token não fornecido.');

    // Verifica o token
    jwt.verify(token, 'chave_secreta', (err, user) => {
        if (err) return res.status(403).send('Token inválido.');
        req.user = user as User; // Cast para User
        next();
    });
};
// Middleware para permissões de acesso
const checkPermission = (req: Request, res: Response, next: NextFunction) => {
    // Verifica se o usuário tem permissão de acesso
    if (req.user && req.user.role !== 'admin') return res.status(403).send('Acesso negado.');
    next();
};

// Configuração do cookie parser
app.use(cookieParser());

// Rota de autenticação para obter token
app.post('/login', (req, res) => {
    // Simulando autenticação
    const username = req.body.username;
    const user = { username: username, role: 'admin' };

    // Cria e envia o token no cookie
    const token = jwt.sign(user, 'chave_secreta');
    res.cookie('token', token);
    res.send('Login bem-sucedido. Token enviado.');
});

// Rota protegida para o jogo
app.get('/jogo', authenticateToken, checkPermission, (req, res) => {
    res.send('Bem-vindo ao jogo de adivinhação de números!');
});

// Rota para sair (remover cookie)
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send('Logout bem-sucedido.');
});

// Inicializando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});