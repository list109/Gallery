//image zoomer

let zoomerImg
let childrenImageArray = []

document.body.addEventListener('click', function ({ target }) {
  zoomerImg = target.closest('.image-zoomer')
  if (!zoomerImg) return
  zoomerImg = zoomerImg.querySelector('img')

  if (zoomerImg === undefined) return

  const zoomerImageArray = reorderArray([...document.querySelectorAll('.image-zoomer img')])

  const { description, src } = getImageProperties(zoomerImg)

  const imageZoomer = makeImageZoomer(src, description)

  const elements = getSubElements(imageZoomer)

  const {
    imageZoomerBox,
    imageZoomerImg,
    imageZoomerDesc,
    imageZoomerClose,
    imageZoomerCover,
    imageZoomerArrowRight,
    imageZoomerArrowLeft,
    imageZoomerList,
    imageZoomerTape
  } = elements

  imageZoomerList.append(...getImageList(zoomerImageArray))
  childrenImageArray = imageZoomerList.children

  document.body.append(imageZoomerBox)

  setTimeout(() => {
    imageZoomerBox.classList.add('imageZoomerBox__showing')
  }, 30)

  imageZoomerImg.onload = () => {
    imageZoomerBox.classList.remove('imageZoomerBox__loading')
  }
  imageZoomerImg.onerror = () => {
    imageZoomerBox.classList.add('imageZoomerBox__error')
    imageZoomerBox.classList.remove('imageZoomerBox__loading')
    imageZoomerDesc.textContent =
      'Извиняемся за неудобства, возникла ошибка при загрузки изображения.'
  }

  document.addEventListener('click', onClick)

  function onClick({ target }) {
    const isClose = imageZoomerClose.contains(target)
    const isInsideImage = imageZoomerCover.contains(target)
    const isInsideTape = imageZoomerTape.contains(target)
    const isInside = isInsideImage || isInsideTape
    const zoomerListItem = target.closest('.imageZoomerList__item')
    const isOutside = !isInside && !imageZoomerBox.classList.contains('imageZoomerBox__loading')

    switch (true) {
      case isClose:
        // case isOutside:
        destroyZoomer(imageZoomerBox, onClick)
        break
      case Boolean(zoomerListItem):
        const { firstElementChild: nextZoomerImg } = zoomerListItem
        changeListItem({ nextZoomerImg, elements, target })
        break
      case imageZoomerArrowRight === target:
        moveImage({ direction: 'right', elements, target })
        break
      case imageZoomerArrowLeft === target:
        moveImage({ direction: 'left', elements, target })
        break
      case isInside:
        break
    }
  }
})

function makeImageZoomer(src, description) {
  const elem = document.createElement('div')
  const figcaption = `
      <figcaption class="imageZoomerDesc" data-element="imageZoomerDesc">${description}</ figcaption>`

  elem.innerHTML = `
      <figure class="imageZoomerBox imageZoomerBox__loading" data-element="imageZoomerBox">
        <i class="fa fa-spinner imageZoomerLoading animation" aria-hidden="true"></i>
        <div class="imageZoomerCover" data-element="imageZoomerCover">
        <i class="fa fa-times imageZoomerClose" aria-hidden="true" data-element="imageZoomerClose"></i>
          <img class="imageZoomerImg" data-element="imageZoomerImg" src="${src}">
          ${description ? figcaption : ''}
        </div>
        
        <div class="imageZoomerTape" data-element="imageZoomerTape">
          <div class="imageZoomerArrow imageZoomerArrow__left" data-element="imageZoomerArrowLeft"></div>
          <div class="imageZoomerArrow imageZoomerArrow__right" data-element="imageZoomerArrowRight"></div>
          <ul class="imageZoomerList" data-element="imageZoomerList"></ul>
        </div>
      </figure>`
  return elem
}

function getImageList(array) {
  return array.map((img, index) => {
    const elem = document.createElement('div')
    elem.innerHTML = `<li class='imageZoomerList__item ${getChosenClass(img.src)}'></li>`
    let li = elem.firstElementChild
    li.append(img.cloneNode())

    const visibilityClass =
      index >= 5 ? 'imageZoomerList__item_hidden' : 'imageZoomerList__item_visible'
    li.classList.add(visibilityClass)

    return li
  })
}

const getChosenClass = src => (zoomerImg.src === src ? 'imageZoomerList__item_chosen' : '')

function moveImage({ direction, elements }) {
  const prevIndex = [...childrenImageArray].findIndex(item =>
    item.classList.contains('imageZoomerList__item_chosen')
  )

  const index = getIndex(prevIndex, direction)

  zoomerImg = childrenImageArray[index].querySelector('img')

  changeItemClass({ index, elements, direction })

  changeImage({ elements })
}

function changeListItem({ nextZoomerImg, elements }) {
  if (zoomerImg) {
    if (nextZoomerImg.src === zoomerImg.src) return
  }
  const index = [...childrenImageArray].indexOf(nextZoomerImg.parentElement)
  zoomerImg = nextZoomerImg

  changeItemClass({ index, elements })
  changeImage({ elements })
}

function changeItemClass({ index, elements, direction }) {
  const { imageZoomerList } = elements
  const { length } = childrenImageArray
  const item = childrenImageArray[index]
  const isItemHidden = item.classList.contains('imageZoomerList__item_hidden')

  changeChoise({ imageZoomerList, item })

  if (isItemHidden && length > 5) {
    changeVisibility({ imageZoomerList, item, direction })
  }
}

function changeChoise({ imageZoomerList, item }) {
  const className = 'imageZoomerList__item_chosen'
  const prev = imageZoomerList.querySelector('.' + className)
  prev.classList.remove(className)
  setTimeout(() => {
    item.classList.add('imageZoomerList__item_chosen')
  })
}

function changeVisibility({ imageZoomerList, item, direction }) {
  let hidenItem

  switch (direction) {
    case 'right':
      hidenItem = imageZoomerList.querySelector('.imageZoomerList__item_visible')
      imageZoomerList.append(hidenItem)
      break
    case 'left':
      const visualChildren = imageZoomerList.querySelectorAll('.imageZoomerList__item_visible')
      hidenItem = visualChildren[visualChildren.length - 1]
      imageZoomerList.prepend(item)
      break
  }

  hidenItem.className = 'imageZoomerList__item imageZoomerList__item_hidden'
  item.className = 'imageZoomerList__item imageZoomerList__item_visible'
}

function changeImage({ elements }) {
  const { imageZoomerImg, imageZoomerDesc, imageZoomerBox, imageZoomerList } = elements

  const { src, description } = getImageProperties(zoomerImg)

  imageZoomerImg.src = src
  imageZoomerDesc.innerHTML = description
  imageZoomerBox.classList.add('imageZoomerBox__loading')
}

function getIndex(prevIndex, direction) {
  const { length } = childrenImageArray
  const directions = { right: prevIndex + 1, left: prevIndex - 1 }

  let index = directions[direction]

  if (index >= length) {
    index = 0
  } else if (index < 0) {
    index = length - 1
  }

  return index
}

function getImageProperties(zoomerImg) {
  const name = zoomerImg.src.split('/').slice(-1)[0]
  const imagesSrc = './images/'

  return {
    description: zoomerImg.alt,
    name,
    src: `${imagesSrc}${name}`
  }
}

function getSubElements(parent) {
  const subelements = [...parent.querySelectorAll('[data-element]')]

  return subelements.reduce((obj, item) => {
    obj[item.dataset.element] = item
    return obj
  }, {})
}

function destroyZoomer(imageZoomerBox, onClick) {
  document.removeEventListener('click', onClick)
  imageZoomerBox.remove()
}

function reorderArray(array) {
  const limit = 5
  const index = array.findIndex(item => item.src === zoomerImg.src)
  if (index < limit) return array

  const firstPartArray = array.slice(index - 4)
  const secondPartArray = array.slice(0, index - 4)

  return firstPartArray.concat(secondPartArray)
}
