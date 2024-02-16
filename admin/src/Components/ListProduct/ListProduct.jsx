import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

const ListProduct = () => {

    const [allproducts, setAllProducts] = useState([]);

    //Fetch request
    //Func for fetch data from api and save data in state variable//
    const fetchInfo = async () =>{
        await fetch('http://localhost:4000/allproducts')
        // Here the we are fetching data and converted into json and saved this data in setAllProducts var//
        .then((res)=>res.json())
        .then((data)=>{setAllProducts(data)})
    }

    //When ever comp is mounted it should fetch
    useEffect(()=>{
        fetchInfo();
    },[])

    const remove_product = async (id)=>{
      await fetch('http://localhost:4000/removeproduct',{
        method:'POST',
        headers:{
          Accept:'application/json',
          'Content-type':'application/json',
        },
        body:JSON.stringify({id:id})
      })
      await fetchInfo();
    }

  return (
    <div className='list-product'>
      <h1>All Product List</h1>
      <div className="listproduct-format-main">
        <p>Products</p> 
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product,index)=>{
            return (
              <>
                <div key={index} className="listproduct-format-main listproduct-format">
                    <img src={product.image} className='listproduct-product-icon' alt="" />
                    <p>{product.name}</p>
                    <p>${product.old_price}</p>
                    <p>${product.new_price}</p>
                    <p>{product.category}</p>
                    <img onClick={()=>{remove_product(product.id)}} src={cross_icon} className='listproduct-remove-icon' alt="" />
                </div>
                <hr />
              </>
            )
        })}
      </div>
    </div>
  )
}

export default ListProduct
