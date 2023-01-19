import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  // Don't retry more than 20 times
  const maxRetries = 20;
  const options = ['Charcoal Sketch of KemYin Dressed in Balenciaga Shirt,', 'Black and White photograph of KemYin Dressed in Prada Shirt,', 'Polaroid Photo of KemYin Dressed in Louis Vuitton Shirt,', 'Studio photography of KemYin Dressed in Gucci Shirt,']
  const options1 = ['highly-detailed, portrait,', 'extremely high detail, portrait,']
  const options2 = ['short lighting', 'rim lighting', 'broad lighting', 'natural lighting,']
  const options3 = ['4k', '8k']
  //const [input, setInput] = useState('');
  const [input, setInput] = useState(options[0])
  const [input1, setInput1] = useState(options1[0])
  const [input2, setInput2] = useState(options2[0])
  const [input3, setInput3] = useState(options3[0])
  const [finalInput, setFinalInput] = useState('')
  const [img, setImg] = useState(''); 

  // Numbers of retries 
  const [retry, setRetry] = useState(0);

  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);

  // Add isGenerating state
  const [isGenerating, setIsGenerating] = useState(false);

  const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value);
  };

  

  const handleChange = (e) => {
    switch (e.target.name) {
      case "input":
        setInput(e.target.value);
        break;
      case "input1":
        setInput1(e.target.value);
        break;
      case "input2":
        setInput2(e.target.value);
        break;
      case "input3":
        setInput3(e.target.value);
        break;
      default:
        break;
    }
    
    console.log(e.target.value)
    setFinalInput(`${input} ${input1} ${input2} ${input3} `)
    console.log(finalInput)
    
  }

  // Add generateAction
  const generateAction = async () => {
    console.log('Generating...');
    console.log(finalInput)
    // If this is a retry request, take away retryCount

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    // Set loading has started
    setIsGenerating(true);

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }
    // Add the fetch request
    //const MyFinalInput = input.replace(/kemyin/gi, 'KemYin');

    const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'image/jpeg',
          },
          body: JSON.stringify({ finalInput }),
          });

    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
        // Set the estimated_time property in state
        setRetry(data.estimated_time);
        
        return;
        }

    // If another error, drop error
    if (!response.ok) {
        console.log(`Error: ${data.error}`);
        return;
      }

    // Set final prompt here
    setFinalInput(`${input} ${input1} ${input2} ${input3}`)
    // Remove content from input box
    
    
    setImg(data.image);

    // Everything is all done -- stop loading!
    setIsGenerating(false);

    }

    const sleep = (ms) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };

    useEffect(() => {
      setFinalInput(`${input} ${input1} ${input2} ${input3} `)
      const runRetry = async () => {
        if (retryCount === 0) {
          console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
          setRetryCount(maxRetries);
          return;
          }
  
        console.log(`Trying again in ${retry} seconds.`);
  
        await sleep(retry * 1000);
  
        await generateAction();
      };
  
      if (retry === 0) {
        return;
      }
  
      runRetry();
    }, [retry, input, input1, input2, input3]);

  return (
    <div className="root">
      <Head>
        <title>AI Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>GenFashion</h1>
          </div>
          <div className="header-subtitle">
            <h2>An AI-enabled Fashion App for KemYin. Who is KemYin?</h2>
          </div>
          {/* Add prompt container here */}
          <div className="prompt-container">
          
          <p>Selected Prompts: {finalInput}</p>
          <select className='prompt-box' name="input" value={input} onChange={handleChange}>
              {options.map(option => (
                <option key={option} value={option}>
              {option}
              </option>
              ))}
          </select>
              <br />
          <select className='prompt-box' name="input1" value={input1} onChange={handleChange}>
              {options1.map(option => (
                <option key={option} value={option}>
              {option}
              </option>
              ))}
          </select>
                <br />
          <select className='prompt-box' name="input2" value={input2} onChange={handleChange}>
              {options2.map(option => (
                <option key={option} value={option}>
              {option}
              </option>
              ))}
          </select>
              <br />
          <select className='prompt-box' name="input3" value={input3} onChange={handleChange}>
              {options3.map(option => (
                <option key={option} value={option}>
              {option}
              </option>
              ))}
          </select>
              {/* Add your prompt button in the prompt container */}
              <div className="prompt-buttons">
                  {/* Tweak classNames to change classes */}
                  <a
                    className={
                      isGenerating ? 'generate-button loading' : 'generate-button'
                      }
                    onClick={generateAction}
                  >
                  {/* Tweak to show a loading indicator */}
                  <div className="generate">
                      {isGenerating ? (
                          <span className="loader"></span>
                        ) : (
                      <p>Generate</p>
                      )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {/* Add output container */}
          {img && (
            <div className="output-content">
              <Image src={img} width={512} height={512} alt={input} />
              <p>{finalInput}</p>
            </div>
          )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
