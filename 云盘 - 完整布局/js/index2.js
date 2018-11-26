(function () {
    //自己
    function findself(id) {
        return treeData.filter((item) => (item.id === (+id)))[0];
    }

    //子集
    function findChild(id) {
        return treeData.filter((item) => (item.pid === id));
    }


    //找到所有父级ID
    function findParents(id) {
        let self = findself(id);
        let parents = [];
        let parent = treeData.filter((item) => (item.id === self.pid))[0];

        if (parent) {
            parents.push(parent);
            parents = parents.concat(findParents(parent.id))
        }
        return parents;
    }

    // console.log(findChild(0), findParents(2), findself(0));

    //试图渲染
    //菜单渲染
    let treeMenu = document.querySelector(".tree-menu");
    let root = -1;
    let level = 0;
    let nowId = 0;
    initMenu();


    //生成树列表内容
    function creatMenu(id, level) {
        level++;
        let parts = findParents(nowId);
        if (!parts) {
            parts = [];
        }
        parts.push(findself(nowId));
        let inner = "<ul>";
        findChild(id).forEach(item => {
            let child = findChild(item.id);
            /*class="${parts.includes(item) ? "open" : ""}"*/
            inner += `<li class="${parts.includes(item) ? "open" : ""}">
                            <p class="${child.length > 0 ? "has-child" : ""} ${nowId == item.id ? "active" : ""}" data-id="${item.id}" style="padding-left: ${level * 20}px">
                                <span><i></i>${item.title}</span>
                            </p>
                            ${child.length > 0 ? creatMenu(item.id, level + 1) : ""}
                        </li>`;
        });
        inner += "</ul>";
        return inner;
    }


    //导航渲染
    let showNowId = findChild(root)[0].id;

    function creatNav(id) {
        let breadNav = document.querySelector('.bread-nav');
        let self = findself(id);
        let parents = findParents(id).reverse();
        // console.log(parents, self)
        let inner = "";
        parents.forEach(item => {
            inner += `<a href="javascript:;" data-id="${item.id}">${item.title}</a>`
        });
        inner += `<span>${self.title}</span>`;
        breadNav.innerHTML = inner;
    }

    creatNav(showNowId);

    //文件夹渲染
    function createlist(id) {
        let folders = document.querySelector("#folders");
        let child = findChild(id);
        let childInner = "";
        child.forEach(item => {
            childInner += `<li class="folder-item  " data-id="${item.id}">
                    <img src="img/folder-b.png" alt="">
                    <span class="folder-name">${item.title}</span>
                    <input type="text" class="editor" value="${item.title}">
                    <label class="checked">
                        <input type="checkbox" />
                        <span class="iconfont icon-checkbox-checked"></span>
                    </label>   
                </li>`;
        });
        folders.innerHTML = childInner;
        allSelect();
    }

    createlist(showNowId);


    /*treeMenu.addEventListener("click", function (e) {
        let item = e.target;
        if (!e.target.classList.contains("has-child")) {
            return true;
        }
        document.querySelectorAll(".active").forEach(j => {
            j.classList.remove("active")
        });
        item.parentElement.classList.toggle("open");
        nowId = Number(item.getAttribute("data-id"));
        //重新渲染数据
        treeMenu.innerHTML = creatMenu(root, level);
        creatNav(nowId);
        createlist(nowId)
    })*/

    //点击树形列表的切换
    function initMenu() {
        treeMenu.innerHTML = creatMenu(root, level);
        let hasChildP = document.querySelectorAll(".has-child");
        hasChildP.forEach(item => {
            item.addEventListener("click", function () {
                nowId = Number(item.getAttribute("data-id"));
                //重新渲染数据
                // treeMenu.innerHTML = creatMenu(root, level);
                initMenu();
                creatNav(nowId);
                createlist(nowId)
            })
        });
    }


    //点击导航的切换
    let nav = document.querySelector(".bread-nav");
    nav.addEventListener("click", function (e) {
        if (e.target.tagName.toLowerCase() === "a") {
            nowId = Number(e.target.getAttribute("data-id"));
            //重新渲染数据
            // treeMenu.innerHTML = creatMenu(root, level);
            initMenu();
            creatNav(nowId);
            createlist(nowId);
            let treeList = Array.from(document.querySelectorAll(".has-child"));
            // console.log(treeList);
            treeList.filter(item => {
                let treeListId = item.getAttribute("data-id");
                if (treeListId == nowId) {
                    let childs = Array.from(item.nextElementSibling.querySelectorAll(".has-child"));
                    childs.forEach(i => {
                        i.parentElement.classList.remove("open")
                    })
                }
            })
        }
    });

    //点击列表切换
    //双击修改名称
    let folders = document.querySelector("#folders");
    folders.addEventListener("dblclick", function (e) {
        if (e.target.className === "folder-name") {//重置名称
            nowId = Number(e.target.parentElement.getAttribute("data-id"));
            let inputText = e.target.nextElementSibling;
            e.target.style.display = "none";
            inputText.style.display = "block";
            inputText.focus();
            //操作输入框
            //失去焦点
            inputText.onblur = function () {
                e.target.style.display = "block";
                inputText.style.display = "none";

            };
            //失去焦点、内容改变时，输入框消失，data数据改变
            inputText.onchange = function () {
                e.target.style.display = "block";
                inputText.style.display = "none";
                titleChange({
                    id: nowId,
                    title: e.target.nextElementSibling.value
                });
                //获取父级的id，再渲染
                let partentID = findParents(nowId)[0].id;
                // treeMenu.innerHTML = creatMenu(root, level);
                initMenu();
                creatNav(partentID);
                createlist(partentID);
                //提示信息修改完成
            }
        }
    });
    //单击做的事情
    folders.addEventListener("click", function (e) {
        // console.log(e.target.tagName);
        //点击到图片就打开它的下一级文件
        if (e.target.tagName.toLowerCase() === "img") {
            nowId = Number(e.target.parentElement.getAttribute("data-id"));
            //判断有没有子集
            let childs = findChild(nowId);
            if (childs.length > 0) {
                // treeMenu.innerHTML = creatMenu(root, level);
                initMenu();
                creatNav(nowId);
                createlist(nowId)
            } else {
                return null;
            }
        } else if (e.target.checked == true) {//选中
            e.target.parentNode.parentNode.classList.add("active");
            let nowID = Number(e.target.parentNode.parentNode.getAttribute("data-id"));
            addAttr({
                id: nowID,
                checked: "checked"
            });
            allSelect();
        } else if (e.target.checked == false) {//没选中
            let nowID = Number(e.target.parentNode.parentNode.getAttribute("data-id"));
            e.target.parentNode.parentNode.classList.remove("active");
            allSelect();
            removeAttr(nowID)
        }
    });

    //全选
    let checkedAll = document.querySelector("#checked-all");
    checkedAll.addEventListener("change", function () {
        document.querySelectorAll("#folders input[type='checkbox']").forEach(item => {
            let nowID = Number(item.parentNode.parentNode.getAttribute("data-id"));
            item.checked = this.checked;
            if(this.checked){
                item.parentNode.parentNode.classList.add("active");
                addAttr({
                    id: nowID,
                    checked: "checked"
                })
            }else {
                item.parentNode.parentNode.classList.remove("active");
                removeAttr(nowID)
            }
        })
    });

    //全选判断
    function allSelect() {
        let allList = document.querySelectorAll(".folder-item");
        let checkedAll = document.querySelector("#checked-all");
        let activeList = document.querySelectorAll("#folders .active");
        if (allList.length == activeList.length) {
            checkedAll.checked = true
        } else {
            checkedAll.checked = false
        }
    }


    //重命名
    function titleChange(op) {
        treeData.forEach(item => {
            if (item.id == op.id) {
                item.title = op.title
            }
        })
    }

    //添加属性
    function addAttr(op) {
        treeData.forEach(item => {
            if (item.id == op.id) {
                item.checked = op.checked
            }
        })
    }

    //移除属性
    function removeAttr(id) {
        treeData.forEach(item => {
            if (item.id == id) {
                delete item.checked;
            }
        })
    }


})();


