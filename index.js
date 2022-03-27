<!DOCTYPE html>
<html>

<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js">  </script>
  <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
  <script src="https://unpkg.com/moralis/dist/moralis.js"></script>
  <script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js" type="application/javascript"></script>
</head>

<body>
  <div>
    <button class="sign-button">Sign</button>
    <button class="load-button">Load</button>
    <div id="status"></div>
    <div id="nfts"></div>
  </div>
  <script type="text/javascript">

    const tokens =
    {
      "1": "recipient_address",
      "2": "recipient_address",
    }
    const collectionAddress = "smart_contract_address"
    const smartWalletAddress = "smart_wallet_address"

    var provider;
    var signer;

    window.addEventListener('load', async () => {
      if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
          await ethereum.enable();
          initApp()
        } catch (err) {
          console.log(err)
          $('#status').html('User denied account access', err)
        }
      } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider)
        initApp()
      } else {
        $('#status').html('No Metamask (or other Web3 Provider) installed')
      }
    })

    function initApp() {
      initEthers()
      initMoralis()
      initSignButton()
      initLoadNftsButton()
    }

    function initEthers() {
      provider = new ethers.providers.Web3Provider(web3.currentProvider);
      signer = provider.getSigner()
    }

    function initMoralis() {
      const serverUrl = "your_moralis_server_url"
      const appId = "your_moralis_app_id"

      Moralis.start({ serverUrl, appId })
    }

    async function initSignButton() {
      $('.sign-button').click(() => {
        signAllTokens()
      })

      async function signAllTokens() {

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        var content = Date.now() + " Generated tokens: \n\n"
        var tokenObjects = new Array()

        for ([tokenId, address] of Object.entries(tokens)) {
          tokenObjects.push(await sign(tokenId, address))
        }

        content += JSON.stringify(tokenObjects)

        downloadFile("generatedTokens.json", content)
      }

      async function sign(_tokenId, _address) {
        const domain = {
          name: 'TOK',
          version: '1.0.0',
          chainId: 4,
          verifyingContract: collectionAddress,
        };

        const types = {
          NFT: [
            { name: 'tokenId', type: 'uint256' },
            { name: 'account', type: 'address' },
          ]
        };

        const value = {
          tokenId: _tokenId,
          account: _address
        };

        const signature = await signer._signTypedData(domain, types, value);

        const object = {
          tokenId: _tokenId,
          address: _address,
          signature: signature,
          signer: smartWalletAddress
        }
        return object
      }

    }

    function initLoadNftsButton() {

      $('.load-button').click(() => {
        const nfts = getUserNfts()
        console.log(nfts)
      })

      async function getUserNfts() {
        const userAddress = await signer.getAddress()
        const options = { chain: 'Rinkeby', address: userAddress };
        return await Moralis.Web3API.account.getNFTs(options);
      }

      async function getNftTokenMetadata(_collectionAddress, _tokenId) {
        const options = { chain: 'Rinkeby', address: _collectionAddress, token_id: _tokenId };
        return await Moralis.Web3API.token.getTokenIdMetadata(options);
      }

    }

    function downloadFile(filename, content) {
      // It works on all HTML5 Ready browsers as it uses the download attribute of the <a> element:
      const element = document.createElement('a');

      //A blob is a data type that can store binary data
      // "type" is a MIME type
      // It can have a different value, based on a file you want to save
      const formattedContent = content.replace(/\n/g, "\r\n");

      const blob = new Blob([formattedContent], { type: 'plain/text', endings: 'native' });

      //createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
      const fileUrl = URL.createObjectURL(blob);

      //setAttribute() Sets the value of an attribute on the specified element.
      element.setAttribute('href', fileUrl); //file location
      element.setAttribute('download', filename); // file name
      element.style.display = 'none';

      //use appendChild() method to move an element from one element to another
      document.body.appendChild(element);
      element.click();

      //The removeChild() method of the Node interface removes a child node from the DOM and returns the removed node
      document.body.removeChild(element);
    };
  </script>
</body>

</html>
