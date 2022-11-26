/** ПО  обработки файлов в post запросах
 * @module file
 * @requires multer
 */
const multer = require('multer')

/**
 * storage multer
 * @name storage
 * @function
 * @inner
 * @param {function} destination 
 * @param {function} filename 
 */
const storage = multer.diskStorage({
    /**
     * function destination
     * @name destination
     * @function
     * @inner
     * @param {Request} req 
     * @param {file} file - фаил
     * @param {callback} cb 
     */
    destination(req, file, cb) {

        cb(null, 'public/images')
    },
      /**
     * function filename
     * @name destination
     * @function
     * @inner
     * @param {Request} req 
     * @param {file} file - фаил
     * @param {callback} cb 
     */
    filename(req, file, cb) {
        cb(null, file.originalname)
    }
})

module.exports = multer({
    storage
})