import { createContext} from 'react'
import React, { useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
//import  navigate  from "react-router-dom";
import api from "../api/posts"
import useWindowSize from "../api/hooks/useWindowSize";
import useAxiosFetch from "../api/hooks/useAxiosFetch";
const DataContext = createContext({});

export const DataProvider = ({children}) => {
    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults ] = useState([]) 
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');
    const navigate = useNavigate();
    const {width} = useWindowSize();
    const {data, fetchError, isLoading} = useAxiosFetch("http://localhost:3500/posts");
    
    useEffect(() => {
      setPosts(data);
    }, [data]);
    
    
    useEffect(() => {
      const filteredResults = posts.filter((post) => 
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));
      setSearchResults(filteredResults.reverse());
    }, [posts, search])
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      const id1 = posts.length ? Number(posts[posts.length - 1].id) + 1 : 1;
      const id = id1.toString();
      const datetime = format(new Date(), 'MMMM dd, yyyy pp');
      const newPost = {id, title: postTitle, datetime, body: postBody };
      try{
        const response = await api.post('/posts', newPost);
        const allPosts = [...posts, response.data];
        setPosts(allPosts);
        setPostTitle('');
        setPostBody('');
        navigate('/');
      } catch (err) {
          console.log(`Error: ${err.message}`);
        
      }
    }
    
    const handleEdit = async (id) => {
      const datetime = format(new Date(), 'MMMM dd, yyyy pp');
      const updatedPost = {id, title: editTitle, datetime, body: editBody };
      try{
        const response = await api.put(`/posts/${id}`, updatedPost);
        setPosts(posts.map(post => post.id===id ? {...response.data} : post));
        setEditTitle('');
        setEditBody('');
        navigate('/')
      }catch (err) {
          console.log(`Error: ${err.message}`);
        
      }
    }
    const handleDelete = async (id) => {
      try{
        await api.delete(`posts/${id}`)
        const postsList = posts.filter(post => post.id !== id);
        setPosts(postsList);
        navigate('/');
    }catch (err) {
        console.log(`Error: ${err.message}`);
        }
    }

    return (

        <DataContext.Provider value={{
            width, search, setSearch, searchResults, 
            fetchError, isLoading, handleSubmit, postTitle, 
            setPostTitle, postBody, setPostBody, 
            handleDelete, posts, handleEdit, editTitle, 
            setEditTitle, editBody, setEditBody

        }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext
