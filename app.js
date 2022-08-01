const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type=range]");
const slidersCon = document.querySelectorAll(".sliders");
const currentHex = document.querySelector(".color h2");
const hexName = document.querySelectorAll(".color h2");
const copyContainer = document.querySelector('.copy-container')
const popupText = document.querySelector('.copy-popup h3')
const ctlIcons = document.querySelectorAll('.controls button')
const settings = document.querySelectorAll('.color-adjust')
const closeBtn = document.querySelectorAll('.close-adjustments')
const lock = document.querySelectorAll('.lock-color');
const saveBtn = document.querySelector('.save')
const palleteNameInput = document.querySelector('.pallete-name')
const submitSave = document.querySelector('.submit-save')
const closeSavePopup = document.querySelector('.close-save-popup')
const palletesCon = document.querySelector('.pallets-con')
const saveContainer = document.querySelector('.save-container')
const libraryContainer = document.querySelector('.library-container')
const colorLibrary = document.querySelector('.color-library')
const palleteItemBody = document.querySelectorAll('.pallete-item')
const clearPallete = document.querySelector('.clear-pallete')
let initialColors = [];
//Local Storage Object
let savedPalletes = [];


//Event Elisterns
sliders.forEach((slider) =>{
    slider.addEventListener('input', hslControls)
})

colorDivs.forEach((color, i) =>{
    color.addEventListener('change', () =>{
        updateText(i)
    })
})


settings.forEach((setting, index) =>{
    setting.addEventListener('click', () =>{
        openSliders(index)
    })
})

closeBtn.forEach((btn, index) =>{
    btn.addEventListener('click', () =>{
        closeSliders(index)
    })
})

lock.forEach((locker, index) =>{
    locker.addEventListener('click', () => {
        colorDivs[index].classList.toggle('locked')
        if(colorDivs[index].classList.contains('locked')){
            locker.innerHTML = '<i class="fi fi-sr-lock"></i>'
        }else{
            locker.innerHTML = '<i class="fi fi-sr-unlock"></i>'
        }
    })
})


hexName.forEach((hex) =>{
    hex.addEventListener('click', () =>{
        copyContainer.classList.add('active');
        copyContainer.style.backgroundColor = hex.innerText;

        const copyTexts = ['Paste Me!', 'Copied!', 'Already Copied!', 'Nice!', 'Okay!', 'Done!', 'Good Choice!', 'Right One!'];

        //random text from array
        const randomText = copyTexts[Math.floor(Math.random() * copyTexts.length)];

        popupText.innerText = randomText;

        //copyToClipBoard
        copyToClipBoard(hex)

        setTimeout(() =>{
            copyContainer.classList.remove('active')
        }, 1500)
    })
})

generateBtn.addEventListener('click', randomColors)


//Event listerns for pallete
saveBtn.addEventListener('click', openPallete)
closeSavePopup.addEventListener('click', closePallet)
submitSave.addEventListener('click', savePallete)

//hide pallete library
palletesCon.addEventListener('click', openLibrarySelect)

//open pallete library
colorLibrary.addEventListener('click', openLibrary)

//clear palletes
clearPallete.addEventListener('click', () =>{
    localStorage.clear();
    savedPalletes = [];
    palletesCon.innerHTML = `<div class="pallete-item default-pallete">
                                <div class="pallete-content">
                                    <div class="preview">
                                        <span class="color-div" style="background-color: rgb(188, 74, 86);">
                                        </span><span class="color-div" style="background-color: rgb(98, 189, 176);">
                                        </span><span class="color-div" style="background-color: rgb(133, 213, 5);">
                                        </span><span class="color-div" style="background-color: rgb(45, 78, 117);">
                                        </span><span class="color-div" style="background-color: rgb(79, 175, 178);">
                                        </span>
                                    </div>
                                    <h4>Great GB Colours <i class="fi fi-sr-lock"></i></h4>
                                </div>
                            </div>`;
})



//generate a hex color
const generateHex = () =>{
    const hexColor = chroma.random();

    return hexColor;
}

//Loop through all the color divs and add event listeners
function randomColors(){

    //initials colors setup
    initialColors = []

    colorDivs.forEach((color, i) =>{
        const hexText = color.children[0]
        const randomColor = generateHex()

        if(color.classList.contains('locked')){
            initialColors.push(hexText.innerText)
            return;
        }else{
            //push the colors to the intial array
            initialColors.push(chroma(randomColor.hex()))
        }
        

        //add color to background
        color.style.backgroundColor = randomColor;
        hexText.innerHTML = randomColor;
        //check for contrast
        checkTextConrast(randomColor, hexText)
        
        //slider bg colors
        const inputBg = chroma(randomColor);
        const sliders = color.querySelectorAll('.sliders input')

        const hue = sliders[0]
        const brightness = sliders[1]
        const saturation = sliders[2]

        //colorize the siders bg
        colorizeSliders(inputBg, hue, brightness, saturation)
    })
    //Button Contrast
    settings.forEach((btn, index) =>{
        checkTextConrast(initialColors[index], btn)
        checkTextConrast(initialColors[index], lock[index])
    })
}

//chech text contast
function checkTextConrast(color, text){
    //returns a value between o- 1

    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black"
    }else{
        text.style.color = '#fff';
    }
}

//colorize sliders
const colorizeSliders = (color, hue, brightness, saturation) =>{
    //scale Saturation
    const notSat = color.set('hsl.s', 0)
    const fullSat = color.set('hsl.s', 1)
    const scaleSat = chroma.scale([notSat, color, fullSat])

    //scale Brightness
    const midBright = color.set('hsl.l', 0.5)
    const scaleBright = chroma.scale(["Black", midBright, "white"])

    //Sc

    //Update input bg colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`

    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`
}

//Input Manipulation
function hslControls(e) {
    const index = 
        e.target.getAttribute("data-brightness") ||
        e.target.getAttribute("data-saturation")||
        e.target.getAttribute("data-hue");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]')

    const hue = sliders[0]
    const brightness = sliders[1]
    const saturation = sliders[2]

    //set bg color depending on input

    const bgColors = initialColors[index]

    //Modify current color based on input
    let color = chroma(bgColors)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);
    
    colorDivs[index].style.backgroundColor = color;

    //colorize sliders
    colorizeSliders(color, hue, brightness, saturation)
}

//uodate text
function updateText(i){
    const activeColor = colorDivs[i]
    //get bg color of current index
    const color = chroma(activeColor.style.backgroundColor)
    //get text
    const textHex = activeColor.querySelector('h2')
    //icons
    const icons = activeColor.querySelectorAll('.controls button')

    //convert color to hex using chroma
    textHex.innerText = color.hex();

    //check contrast
    checkTextConrast(color, textHex)

    //icons constrast
    for(icon of icons){
        //icon contrast
        checkTextConrast(color, icon)
    }
}

//copy colro to clip board
function copyToClipBoard(hex){
    const element = document.createElement('textarea')

    element.value = hex.innerText;
    document.body.appendChild(element)
    element.select()

    document.execCommand('copy')
    document.body.removeChild(element)
}


function openSliders(index){
    slidersCon[index].classList.toggle('active')
}

function closeSliders(index){
    slidersCon[index].classList.toggle('active')
}


//Save to pallete and local storage
//Open Pallete creator
function openPallete(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active')
    popup.classList.add('active')
}
//close pallete
function closePallet(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active')
    popup.classList.remove('active')
}

function savePallete(e){
    const colors = []
    const palleteName = palleteNameInput.value;
    
    colorDivs.forEach((color) =>{
        const text = color.querySelector('h2').innerText;
        colors.push(text)
    })

    //Pallete Object

    let palleteNumber;
    const palleteObj = JSON.parse(localStorage.getItem('palletes'));
    if(palleteObj){
        palleteNumber = palleteObj.length;
    }else{
        palleteNumber = savedPalletes.length;
    }

    const pallete = {
        name: palleteName,
        colors: colors,
        number: palleteNumber
    }
    savedPalletes.push(pallete)

    //save to local storage
    saveToLocal(pallete)


    //close pallete
    closePallet()
    palleteNameInput.value = '';

    //create a palette for the library
    const palleteItem = document.createElement('div')
    palleteItem.classList.add('pallete-item')
    palleteItem.classList.add(pallete.number)

    const title = document.createElement('h4')
    title.innerText = pallete.name;
    
    const palleteItemContent = document.createElement('div')
    palleteItemContent.classList.add('pallete-content')

    const preview = document.createElement('div')
    preview.classList.add('preview')

    pallete.colors.forEach((color)=>{
        const colorDivs = document.createElement('span')
        colorDivs.classList.add('color-div')
        colorDivs.style.backgroundColor = color;

        preview.appendChild(colorDivs)
    })
    palleteItemContent.appendChild(preview)
    palleteItemContent.appendChild(title)
    palleteItem.appendChild(palleteItemContent)
    //add pallet item to pallets container
    palletesCon.appendChild(palleteItem)
    

    palletesCon.addEventListener('click', (e) =>{
        const palleteindex = e.target.classList[1]
        initialColors = [];

        savedPalletes[palleteindex].colors.forEach((color, index) =>{
            initialColors.push(color)
            colorDivs[index].style.backgroundColor = color;
            //check contrast
            checkTextConrast(color, colorDivs[index].querySelector('h2'))
            //update text
            updateText(index)

             //reset sliders
            colorDivs.forEach((color, index) =>{
                //reset sliders
                const sliders = color.querySelectorAll('input[type="range"]')
                sliders.forEach((slider) =>{
                    slider.value = ''
                })
            })
        })

    })


     //reset sliders
    colorDivs.forEach((color, index) =>{
        //reset sliders
        const sliders = color.querySelectorAll('input[type="range"]')
        sliders.forEach((slider) =>{
            slider.value = ''
        })
    })
}

//Open library of palletes
function openLibrary(e){
    //toggle Hidden class
    libraryContainer.classList.toggle('hidden')
}

function openLibrarySelect(e){
    //toggle Hidden class
    libraryContainer.classList.toggle('hidden')
}

//save to local storage
function saveToLocal(pallete){
    let pallets;

    //check if there is something in the storage
    if(localStorage.getItem('palletes') === null){
        //create a new array if palletes doesn't exist
        pallets = []
    }else{
        //return If there are items in there
        pallets = JSON.parse(localStorage.getItem('palletes'))
    }

    //push pallete into the array and push back to local storage
    pallets.push(pallete)
    localStorage.setItem('palletes', JSON.stringify(pallets))
}

//get from local storage
function getFromLocal(){
    let pallets;

    //check if there is something in the storage
    if(localStorage.getItem('palletes') === null){
        //create a new array if palletes doesn't exist
        pallets = []
    }else{
        //return If there are items in there
        pallets = JSON.parse(localStorage.getItem('palletes'))
        //loop through the palletes
        pallets.forEach((pallete, index) =>{
            //create a palette for the library
            const palleteItem = document.createElement('div')
            palleteItem.classList.add('pallete-item')
            palleteItem.classList.add(pallete.number)

            const title = document.createElement('h4')
            title.innerText = pallete.name;
            
            const palleteItemContent = document.createElement('div')
            palleteItemContent.classList.add('pallete-content')

            const preview = document.createElement('div')
            preview.classList.add('preview')

            pallete.colors.forEach((color)=>{
                const colorDivs = document.createElement('span')
                colorDivs.classList.add('color-div')
                colorDivs.style.backgroundColor = color;

                preview.appendChild(colorDivs)
            })
            palleteItemContent.appendChild(preview)
            palleteItemContent.appendChild(title)
            palleteItem.appendChild(palleteItemContent)
            //add pallet item to pallets container
            palletesCon.appendChild(palleteItem)
        
            palletesCon.addEventListener('click', (e) =>{
                const palleteindex = e.target.classList[1]
                initialColors = [];

                pallets[palleteindex].colors.forEach((color, index) =>{
                    initialColors.push(color)
                    colorDivs[index].style.backgroundColor = color;
                    //check contrast
                    checkTextConrast(color, colorDivs[index].querySelector('h2'))
                    //update text
                    updateText(index)

                    //reset sliders
                    colorDivs.forEach((color, index) =>{
                        //reset sliders
                        const sliders = color.querySelectorAll('input[type="range"]')
                        sliders.forEach((slider) =>{
                            slider.value = ''
                        })
                    })
                })
        })


            //reset sliders
            colorDivs.forEach((color, index) =>{
                //reset sliders
                const sliders = color.querySelectorAll('input[type="range"]')
                sliders.forEach((slider) =>{
                    slider.value = ''
                })
            })
        })
    }

    //return pallets
    return pallets;
}

getFromLocal()
randomColors()
