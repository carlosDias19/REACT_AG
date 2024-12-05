import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../services/http';
import Swal from 'sweetalert2';
import { Box, Tabs, Tab } from '@mui/material';
import './form.css';

const ProdutoForm = () => {
  const [value, setValue] = useState(0);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState(null);
  const [searchId, setSearchId] = useState('');

  const fetchProdutos = async () => {
    try {
      const response = await axiosInstance.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchProdutoById = async (id) => {
    try {
      const response = await axiosInstance.get(`/produtos/${id}`);
      const produto = response.data;
      setNome(produto.nome);
      setPreco(produto.preco);
      setDescricao(produto.descricao);
      setProdutoId(id);
      setValue(0);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao buscar produto.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !preco || !descricao) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Todos os campos são obrigatórios!' });
      return;
    }

    if (preco < 0 || isNaN(preco)) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Preço deve ser válido.' });
      return;
    }

    try {
      if (produtoId) {
        await axiosInstance.patch(`/produtos/${produtoId}`, { nome, preco: parseFloat(preco), descricao });
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Produto atualizado!' });
      } else {
        await axiosInstance.post('/produtos', { nome, preco: parseFloat(preco), descricao });
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Produto cadastrado!' });
      }

      setNome('');
      setPreco('');
      setDescricao('');
      setProdutoId(null);
      fetchProdutos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao cadastrar ou atualizar produto.' });
    }
  };

  const handleDelete = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/produtos/${id}`);
      Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Produto excluído!' });
      fetchProdutos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao excluir produto.' });
    }
  }, [fetchProdutos]); // Apenas recria a função handleDelete quando fetchProdutos mudar

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setNome('');
    setPreco('');
    setDescricao('');
    setProdutoId(null);
    setSearchId('');
  };

  const handleSearchById = () => {
    if (searchId) {
      fetchProdutoById(searchId);
    } else {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Insira um ID válido para buscar.' });
    }
  };

  const produtosMemo = useMemo(() => {
    return produtos.map((produto) => (
      <tr key={produto.id}>
        <td>{produto.nome}</td>
        <td>{produto.preco}</td>
        <td>{produto.descricao}</td>
        <td>
          <button onClick={() => fetchProdutoById(produto.id)}>Editar</button>
          <button onClick={() => handleDelete(produto.id)}>Excluir</button>
        </td>
      </tr>
    ));
  }, [produtos, handleDelete]); // Agora handleDelete é uma função estável

  return (
    <div className="form-container">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Cadastrar Produto" />
          <Tab label="Produtos Cadastrados" />
          <Tab label="Buscar Produto por ID" />
        </Tabs>
      </Box>

      {value === 0 && (
        <div>
          <h2>{produtoId ? 'Editar Produto' : 'Cadastro de Produto'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="preco">Preço:</label>
              <input type="number" id="preco" value={preco} onChange={(e) => setPreco(e.target.value)} required step="0.01" min="0" />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição:</label>
              <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            </div>

            <button type="submit">{produtoId ? 'Atualizar' : 'Cadastrar'}</button>
          </form>
        </div>
      )}

      {value === 1 && (
        <div>
          <h3>Produtos Cadastrados</h3>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosMemo}
            </tbody>
          </table>
        </div>
      )}

      {value === 2 && (
        <div>
          <h3>Buscar Produto por ID</h3>
          <div className="form-group">
            <label htmlFor="searchId">ID do Produto:</label>
            <input type="text" id="searchId" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Digite o ID do produto" />
            <button onClick={handleSearchById}>Buscar</button>
          </div>
          {produtoId && (
            <div>
              <h4>Produto Encontrado</h4>
              <p><strong>Nome:</strong> {nome}</p>
              <p><strong>Preço:</strong> {preco}</p>
              <p><strong>Descrição:</strong> {descricao}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProdutoForm;
