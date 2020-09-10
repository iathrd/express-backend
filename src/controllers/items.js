const db = require('../helpers/db')
const qs = require('querystring')

const { getItemModel, createItemModel, updateItemModel, updatePartialModel, deleteItemModel, searchItemModel } = require('../models/items')

module.exports = {
  createItem: (req, res) => {
    const { name, price, description } = req.body
    if (name && price && description) {
      createItemModel([name, price, description], result => {
        res.status(201).send({
          success: true,
          message: 'Item has been created',
          data: {
            id: result.id,
            ...req.body
          }
        })
      })
    } else {
      res.send({
        success: false,
        message: 'All field must be filled'
      })
    }
  },
  getDetailItem: (req, res) => {
    const { id } = req.params

    getItemModel(id, result => {
      if (result.length) {
        res.send({
          success: true,
          message: 'List of Data',
          data: result
        })
      } else {
        res.status(404).send({
          success: false,
          messgae: "Data does't exist"
        })
      }
    })
  },
  getItem: (req, res) => {
    let { page, limit, search } = req.query
    let searchKey = ''
    let searchValue = ''

    if (typeof search === 'object') {
      searchKey = Object.keys(search)[0]
      searchValue = Object.values(search)[0]
    } else {
      searchKey = 'name'
      searchValue = search || ''
    }

    if (!limit) {
      limit = 5
    } else {
      limit = parseInt(limit)
    }
    if (!page) {
      page = 1
    } else {
      page = parseInt(page)
    }
    page = (page - 1) * limit
    searchItemModel(searchKey, searchValue, [limit, page], result => {
      if (result) {
        const pageInfo = {
          count: 0,
          pages: 0,
          currentPage: page,
          limitPerPage: limit,
          nextLink: null,
          prevLink: null
        }
        if (result.length) {
          db.query(`SELECT COUNT (*) as count FROM items WHERE ${searchKey} LIKE '%${searchValue}%'`, (_err, data, _field) => {
            const { count } = data[0]
            pageInfo.count = count
            pageInfo.pages = Math.ceil(count / limit)
            const { pages, currentPage } = pageInfo
            if (currentPage < pages) {
              pageInfo.nextLink = `http://localhost:8080/items?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
            }

            if (currentPage > 1) {
              pageInfo.prevLink = `http://localhost:8080/items?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
            }
            res.send({
              success: true,
              message: 'List of item',
              data: result,
              pageInfo
            })
          })
        } else {
          res.send({
            success: false,
            message: 'Data not found'
          })
        }
      } else {
        res.status(500).send({
          success: false,
          messgae: 'Internal Server Error'
        })
      }
    })
  },
  updateItem: (req, res) => {
    const { name, price, description } = req.body
    const { id } = req.params
    if (name.trim() && price.trim() && description.trim()) {
      getItemModel(id, dataResult => {
        if (dataResult.length > 0) {
          updateItemModel(id, [name, price, description], result => {
            if (result.affectedRows) {
              res.send({
                success: true,
                message: 'data updated !',
                data: {
                  name,
                  price,
                  description
                }
              })
            } else {
              res.status(500).send({
                success: false,
                message: 'Internal Server Error'
              })
            }
          })
        } else {
          res.status(404).send({
            success: false,
            message: `Data with id ${id} does't exist`
          })
        }
      })
    } else {
      res.status(400).send({
        success: false,
        message: 'All data must be filled'
      })
    }
  },
  updatePatrialItem: (req, res) => {
    const { id } = req.params
    const { name = '', price = '', description = '' } = req.body

    if (name.trim() || price.trim() || description.trim()) {
      getItemModel(id, result => {
        if (result.length) {
          const data = Object.entries(req.body).map(item => {
            return parseInt(item[1] > 0) ? `${item[0]} = ${item[1]}` : `${item[0]} = '${item[1]}'`
          })
          updatePartialModel(id, data, result => {
            console.log()
            if (result.affectedRows > 0) {
              res.send({
                success: true,
                message: `Item ${id} has been updated`
              })
            } else {
              res.send({
                success: false,
                message: 'Failed to update data'
              })
            }
          })
        } else {
          res.send({
            success: false,
            message: `There is no item with id ${id}`
          })
        }
      })
    }
  },

  deleteItem: (req, res) => {
    const { id } = req.params
    getItemModel(id, dataResult => {
      if (dataResult.length > 0) {
        deleteItemModel(id, result => {
          console.log(result)
          if (result.affectedRows > 0) {
            res.send({
              success: true,
              message: 'data has been deleted',
              data: null
            })
          } else {
            res.status(500).send({
              success: false,
              message: 'Internal Server Error'
            })
          }
        })
      } else {
        res.status(404).send({
          success: false,
          message: `Data with id ${id} does't exist`
        })
      }
    })
  }

}
