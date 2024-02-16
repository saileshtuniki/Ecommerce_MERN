import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'


const AddProduct = () => {

    // Creating a State to display image on the upload at lable //
    const [image, setImage] = useState(false);

    const [productDetails, setproductDetails] = useState({
        name:"",
        image:"",
        category:"women",
        new_price:"",
        old_price:""
    })
    //to set image func
    const imageHandler = (e) =>{
        setImage(e.target.files[0]);
    }
    //product details func
    const changeHandler = (e)=>{
        setproductDetails({...productDetails,[e.target.name]:e.target.value})
    }
    //ADD btn Func
    const Add_Product = async () =>{
        console.log(productDetails);
        let responseData;
        //created a copy of productDetails State as product
        let product = productDetails;

        let formData = new FormData();
        formData.append('product',image)

        await fetch('http://localhost:4000/upload',{
            method:'POST',
            headers:{
                Accept:'application/json'
            },
            body:formData,
        }).then((resp)=>resp.json()).then((data)=>{responseData=data})

        if(responseData.success){
            product.image = responseData.image_url
            console.log(product);
            await fetch('http://localhost:4000/addproduct',{
            method:'POST',
            headers:{
            Accept:'application/json',
            'Content-Type': 'application/json',
            },
            body:JSON.stringify(product),
            }).then((resp)=>resp.json()).then((data)=>{
                data.success ? alert ("Product Added ") : alert ("Failed")
            })
        }
    }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
            <p>Price</p>
            <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type Here'/>
        </div>
        <div className="addproduct-itemfield">
            <p>Offer Price</p>
            <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type Here'/>
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
            <img src={image?URL.createObjectURL(image):upload_area} className="addproduct-thumnail-img" alt="" />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
      </div>
      <button onClick={()=>Add_Product()} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct
