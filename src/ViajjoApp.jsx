import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Container, Box, TextField, Button, Card, CardContent, Tabs, Tab, Grid, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Dashboard, Flight, Receipt, BarChart, Person, Logout, Add, Delete } from '@mui/icons-material';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [registro, setRegistro] = useState(false);
  const [aba, setAba] = useState(0);
  const [usuarios, setUsuarios] = useState({});
  
  const [perfil, setPerfil] = useState({ nome: '', origem: '', empresa: '' });
  const [viagens, setViagens] = useState([]);
  const [despesas, setDespesas] = useState([]);
  
  const [tripForm, setTripForm] = useState({ empresa: '', inicio: '', fim: '', destino: '' });
  const [expForm, setExpForm] = useState({ desc: '', valor: '', cat: 'Hospedagem', data: '' });

  useEffect(() => {
    const sU = localStorage.getItem('viajjoUsers');
    if (sU) setUsuarios(JSON.parse(sU));
    const cU = localStorage.getItem('viajjoUser');
    if (cU) setUser(cU);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) { alert('Preencha os campos'); return; }
    
    if (registro) {
      if (usuarios[email]) { alert('Email já existe'); return; }
      const nu = { senha, perfil: { nome: '', origem: '', empresa: '' }, viagens: [], despesas: [] };
      const newU = { ...usuarios, [email]: nu };
      setUsuarios(newU);
      localStorage.setItem('viajjoUsers', JSON.stringify(newU));
      setUser(email);
      localStorage.setItem('viajjoUser', email);
      setEmail(''); setSenha(''); setRegistro(false);
    } else {
      if (!usuarios[email] || usuarios[email].senha !== senha) { alert('Credenciais inválidas'); return; }
      setUser(email);
      localStorage.setItem('viajjoUser', email);
      setEmail(''); setSenha('');
    }
  };

  const logout = () => { setUser(null); localStorage.removeItem('viajjoUser'); };

  if (!user) {
    return (
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant='h4' sx={{ textAlign: 'center', mb: 1 }}>🧳 Viajjo</Typography>
            <Typography sx={{ textAlign: 'center', color: '#666', mb: 3 }}>Professional Expense Manager</Typography>
            <Box component='form' onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label='Email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} fullWidth size='small' />
              <TextField label='Senha' type='password' value={senha} onChange={(e) => setSenha(e.target.value)} fullWidth size='small' />
              <Button variant='contained' type='submit' fullWidth>{registro ? 'Criar Conta' : 'Entrar'}</Button>
            </Box>
            <Button fullWidth sx={{ mt: 2 }} onClick={() => setRegistro(!registro)}>{registro ? 'Já tem conta?' : 'Criar nova conta'}</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const userData = usuarios[user] || { perfil: { nome: '', origem: '', empresa: '' }, viagens: [], despesas: [] };
  const totalGasto = (userData.despesas || []).reduce((s, d) => s + parseFloat(d.valor || 0), 0);
  const cats = ['Hospedagem', 'Alimentação', 'Transporte', 'Combustível', 'Entretenimento', 'Outro'];
  const despPorCat = cats.map(c => ({ cat: c, val: (userData.despesas || []).filter(d => d.cat === c).reduce((s, d) => s + parseFloat(d.valor || 0), 0) }));

  return (
    <Box>
      <AppBar><Toolbar><Typography variant='h6' sx={{ flex: 1 }}>🧳 Viajjo Pro</Typography><Button startIcon={<Logout />} onClick={logout} color='inherit'>Sair</Button></Toolbar></AppBar>
      <Container maxWidth='lg' sx={{ mt: 10, mb: 5 }}>
        <Tabs value={aba} onChange={(_, v) => setAba(v)}>
          <Tab label='Dashboard' icon={<Dashboard />} />
          <Tab label='Viagens' icon={<Flight />} />
          <Tab label='Despesas' icon={<Receipt />} />
          <Tab label='Relatórios' icon={<BarChart />} />
          <Tab label='Perfil' icon={<Person />} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {aba === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Card><CardContent><Typography>Total Gasto</Typography><Typography variant='h4' sx={{ color: '#667eea' }}>R$ {totalGasto.toFixed(2)}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={6}><Card><CardContent><Typography>Viagens</Typography><Typography variant='h4' sx={{ color: '#667eea' }}>{(userData.viagens || []).length}</Typography></CardContent></Card></Grid>
              <Grid item xs={12}><Card><CardContent><Typography variant='h6' sx={{ mb: 2 }}>Despesas por Categoria</Typography><Pie data={{ labels: despPorCat.map(x => x.cat), datasets: [{ data: despPorCat.map(x => x.val), backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'] }] }} height={200} /></CardContent></Card></Grid>
            </Grid>
          )}
          
          {aba === 1 && (
            <Card><CardContent><h3>Minhas Viagens</h3><Grid container spacing={2}><Grid item xs={12} md={6}><TextField label='Empresa' value={tripForm.empresa} onChange={(e) => setTripForm({ ...tripForm, empresa: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12} md={6}><TextField label='Início' type='date' value={tripForm.inicio} onChange={(e) => setTripForm({ ...tripForm, inicio: e.target.value })} fullWidth size='small' InputLabelProps={{ shrink: true }} /></Grid><Grid item xs={12} md={6}><TextField label='Fim' type='date' value={tripForm.fim} onChange={(e) => setTripForm({ ...tripForm, fim: e.target.value })} fullWidth size='small' InputLabelProps={{ shrink: true }} /></Grid><Grid item xs={12} md={6}><TextField label='Destino' value={tripForm.destino} onChange={(e) => setTripForm({ ...tripForm, destino: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12}><Button variant='contained' startIcon={<Add />} onClick={() => { setViagens([...viagens, { ...tripForm, id: Date.now() }]); setTripForm({ empresa: '', inicio: '', fim: '', destino: '' }); }} fullWidth>Adicionar Viagem</Button></Grid></Grid></CardContent></Card>
          )}
          
          {aba === 2 && (
            <Card><CardContent><h3>Minhas Despesas</h3><Grid container spacing={2}><Grid item xs={12} md={3}><TextField label='Descrição' value={expForm.desc} onChange={(e) => setExpForm({ ...expForm, desc: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12} md={3}><TextField label='Valor' type='number' value={expForm.valor} onChange={(e) => setExpForm({ ...expForm, valor: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12} md={3}><FormControl fullWidth size='small'><InputLabel>Categoria</InputLabel><Select value={expForm.cat} onChange={(e) => setExpForm({ ...expForm, cat: e.target.value })} label='Categoria'>{cats.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Grid><Grid item xs={12} md={3}><TextField label='Data' type='date' value={expForm.data} onChange={(e) => setExpForm({ ...expForm, data: e.target.value })} fullWidth size='small' InputLabelProps={{ shrink: true }} /></Grid><Grid item xs={12}><Button variant='contained' startIcon={<Add />} onClick={() => { setDespesas([...despesas, { ...expForm, id: Date.now() }]); setExpForm({ desc: '', valor: '', cat: 'Hospedagem', data: '' }); }} fullWidth>Adicionar Despesa</Button></Grid></Grid></CardContent></Card>
          )}
          
          {aba === 3 && (
            <Card><CardContent><Typography variant='h5' sx={{ mb: 2 }}>Relatório Anual</Typography><Typography>Total Gasto: R$ {totalGasto.toFixed(2)}</Typography><Typography>Total de Viagens: {viagens.length}</Typography><Typography>Total de Despesas: {despesas.length}</Typography><Button variant='contained' sx={{ mt: 2 }}>Exportar PDF</Button></CardContent></Card>
          )}
          
          {aba === 4 && (
            <Card><CardContent><h3>Meu Perfil</h3><Grid container spacing={2}><Grid item xs={12} md={6}><TextField label='Nome Completo' value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12} md={6}><TextField label='Cidade de Origem' value={perfil.origem} onChange={(e) => setPerfil({ ...perfil, origem: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12}><TextField label='Empresa' value={perfil.empresa} onChange={(e) => setPerfil({ ...perfil, empresa: e.target.value })} fullWidth size='small' /></Grid><Grid item xs={12}><Button variant='contained' onClick={() => { const u = { ...usuarios[user], perfil }; setUsuarios({ ...usuarios, [user]: u }); localStorage.setItem('viajjoUsers', JSON.stringify({ ...usuarios, [user]: u })); alert('Perfil salvo!'); }} fullWidth>Salvar Perfil</Button></Grid></Grid></CardContent></Card>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default App;
